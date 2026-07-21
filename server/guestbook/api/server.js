import { createHmac, timingSafeEqual } from "node:crypto";

import Fastify from "fastify";
import pg from "pg";

const { Pool } = pg;

const API_TOKEN = process.env.API_TOKEN ?? "";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? "";
const IP_HASH_SALT = process.env.IP_HASH_SALT ?? "";
const AUTO_APPROVE = process.env.AUTO_APPROVE === "true";
const RATE_LIMIT_SECONDS = Number(process.env.RATE_LIMIT_SECONDS ?? 30);
const PORT = Number(process.env.PORT ?? 3000);

for (const [key, value] of Object.entries({
  API_TOKEN,
  ADMIN_TOKEN,
  IP_HASH_SALT,
})) {
  if (!value) {
    console.error(`[boot] missing required env var: ${key}`);
    process.exit(1);
  }
}

const NAME_MAX = 40;
const MESSAGE_MAX = 280;
const FETCH_LIMIT_MAX = 200;

const SPACE = 32;
const DEL = 127;

const STATUSES = ["pending", "approved", "rejected"];

/**
 * Zero-width and bidirectional-control code points. They are invisible, so they
 * are useless to an honest signer but let an attacker slip past the link filter
 * ("http<ZWSP>s://...") or visually reorder a signature for every other visitor
 * (a trojan-source style trick). Written as hex literals rather than string
 * escapes so this file stays pure ASCII.
 */
const INVISIBLE_CODE_POINTS = new Set([
  0x200b, 0x200c, 0x200d, 0x200e, 0x200f, 0x2060, 0xfeff,
  0x202a, 0x202b, 0x202c, 0x202d, 0x202e,
  0x2066, 0x2067, 0x2068, 0x2069,
]);

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });

const app = Fastify({ logger: true, bodyLimit: 16 * 1024 });

/**
 * The bodyless admin endpoints are still commonly called with a JSON content
 * type. Fastify rejects that combination with a 400 before routing, so treat
 * an empty body as an empty object instead.
 */
app.addContentTypeParser(
  "application/json",
  { parseAs: "string" },
  (_request, body, done) => {
    if (!body || body.trim() === "") return done(null, {});
    try {
      done(null, JSON.parse(body));
    } catch {
      const error = new Error("invalid JSON body");
      error.statusCode = 400;
      done(error, undefined);
    }
  },
);

/**
 * Never let a raw driver error reach the client — a bad :id used to surface the
 * Postgres error code and message verbatim. Log the real thing, return a
 * generic one.
 */
app.setErrorHandler((error, request, reply) => {
  const status = error.statusCode ?? 500;
  if (status >= 500) {
    request.log.error({ err: error }, "unhandled route error");
    return reply.code(500).send({ error: "internal error" });
  }
  return reply.code(status).send({ error: error.message ?? "request failed" });
});

// --- helpers ---------------------------------------------------------------

/** Constant-time compare that tolerates unequal lengths without throwing. */
const safeEqual = (a, b) => {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length || left.length === 0) return false;
  return timingSafeEqual(left, right);
};

const bearerToken = (request) => {
  const header = request.headers.authorization ?? "";
  return header.startsWith("Bearer ") ? header.slice(7) : "";
};

const requireToken = (expected) => async (request, reply) => {
  if (!safeEqual(bearerToken(request), expected)) {
    return reply.code(401).send({ error: "unauthorized" });
  }
};

const hmac = (value) =>
  createHmac("sha256", IP_HASH_SALT).update(value).digest("hex");

/**
 * Visitor IPs are hashed, never stored raw. The caller (the Next.js server
 * action) forwards the real client IP, since the request itself originates
 * from Vercel's infrastructure.
 *
 * A missing header must NOT disable rate limiting — that failed open and let an
 * unlimited stream of signatures through. Callers without an IP share a single
 * bucket instead, so they stay throttled.
 */
const UNKNOWN_IP_BUCKET = "unknown-visitor";

const rateLimitKey = (request) => {
  const forwarded = request.headers["x-visitor-ip"];
  const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  const trimmed = typeof ip === "string" ? ip.trim() : "";
  return hmac(trimmed || UNKNOWN_IP_BUCKET);
};

/**
 * Drop control characters (bots and paste accidents) and invisible formatting
 * characters (filter evasion and display spoofing), normalise compatibility
 * forms, then collapse whitespace runs.
 */
const clean = (value) => {
  if (typeof value !== "string") return "";
  let out = "";
  for (const char of value.normalize("NFKC")) {
    const code = char.codePointAt(0);
    if (INVISIBLE_CODE_POINTS.has(code)) continue;
    out += code < SPACE || code === DEL ? " " : char;
  }
  return out.replace(/\s+/g, " ").trim();
};

/**
 * Link detection: the obvious forms plus the obfuscations that trivially beat a
 * bare protocol match — "spam[dot]com", "spam dot com", "spam (.) com".
 *
 * This is a heuristic and always will be; a determined spammer can describe a
 * domain in prose. It runs on already-cleaned text, so zero-width evasion is
 * handled upstream in clean().
 */
const TLDS =
  "com|net|org|io|co|de|ch|ru|cn|xyz|top|info|biz|shop|club|online|site|live|link|app|dev|me|tv|cc|pw|casino|bet|loan|work|click|example";

const SEPARATOR =
  "\\s*(?:\\.|\\[\\s*dot\\s*\\]|\\(\\s*\\.?\\s*\\)|\\s+dot\\s+)\\s*";

const LINK_PATTERNS = [
  /https?:\s*\/\//i,
  /www\s*\./i,
  /\[url|<a\s|href\s*=/i,
  new RegExp(`\\b[a-z0-9][a-z0-9-]*${SEPARATOR}(?:${TLDS})\\b`, "i"),
];

const looksLikeSpam = (text) => LINK_PATTERNS.some((pattern) => pattern.test(text));

/** Reject anything that is not a positive integer before it reaches Postgres. */
const parseId = (raw) => {
  if (!/^\d+$/.test(String(raw))) return null;
  const id = Number(raw);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

const serialize = (row) => ({
  id: String(row.id),
  name: row.name,
  message: row.message,
  signedAt: row.created_at.toISOString(),
});

// --- schema ----------------------------------------------------------------

await pool.query(`
  CREATE TABLE IF NOT EXISTS entries (
    id          BIGSERIAL PRIMARY KEY,
    name        TEXT NOT NULL,
    message     TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'pending',
    ip_hash     TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
  );
`);

await pool.query(`
  CREATE INDEX IF NOT EXISTS entries_status_created_idx
    ON entries (status, created_at DESC);
`);

await pool.query(`
  CREATE INDEX IF NOT EXISTS entries_ip_hash_created_idx
    ON entries (ip_hash, created_at DESC);
`);

// Defense in depth: nothing should ever write a status outside this set.
await pool.query(
  `ALTER TABLE entries DROP CONSTRAINT IF EXISTS entries_status_check;`,
);
await pool.query(`
  ALTER TABLE entries
    ADD CONSTRAINT entries_status_check
    CHECK (status IN ('pending', 'approved', 'rejected'));
`);

// --- routes ----------------------------------------------------------------

app.get("/health", async () => {
  await pool.query("SELECT 1");
  return { ok: true };
});

app.get("/entries", { preHandler: requireToken(API_TOKEN) }, async (request) => {
  const requested = Number(request.query?.limit ?? 50);
  const limit = Number.isFinite(requested)
    ? Math.min(Math.max(Math.trunc(requested), 1), FETCH_LIMIT_MAX)
    : 50;

  const { rows } = await pool.query(
    `SELECT id, name, message, created_at
       FROM entries
      WHERE status = 'approved'
      ORDER BY created_at DESC
      LIMIT $1`,
    [limit],
  );

  return { entries: rows.map(serialize) };
});

app.post(
  "/sign",
  { preHandler: requireToken(API_TOKEN) },
  async (request, reply) => {
    const name = clean(request.body?.name);
    const message = clean(request.body?.message);

    if (!name || !message) {
      return reply.code(400).send({ error: "name and message are required" });
    }
    if (name.length > NAME_MAX) {
      return reply
        .code(400)
        .send({ error: `name must be ${NAME_MAX} characters or fewer` });
    }
    if (message.length > MESSAGE_MAX) {
      return reply
        .code(400)
        .send({ error: `message must be ${MESSAGE_MAX} characters or fewer` });
    }
    if (looksLikeSpam(message) || looksLikeSpam(name)) {
      return reply
        .code(422)
        .send({ error: "links are not allowed in the guestbook" });
    }

    const ipHash = rateLimitKey(request);

    if (RATE_LIMIT_SECONDS > 0) {
      const { rows } = await pool.query(
        `SELECT 1
           FROM entries
          WHERE ip_hash = $1
            AND created_at > now() - ($2 || ' seconds')::interval
          LIMIT 1`,
        [ipHash, String(RATE_LIMIT_SECONDS)],
      );
      if (rows.length > 0) {
        return reply.code(429).send({
          error: "you just signed, give it a moment before signing again",
        });
      }
    }

    const status = AUTO_APPROVE ? "approved" : "pending";
    const { rows } = await pool.query(
      `INSERT INTO entries (name, message, status, ip_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, message, created_at`,
      [name, message, status, ipHash],
    );

    return reply.code(201).send({ status, entry: serialize(rows[0]) });
  },
);

// --- moderation ------------------------------------------------------------

app.get(
  "/admin/entries",
  { preHandler: requireToken(ADMIN_TOKEN) },
  async (request, reply) => {
    const status = request.query?.status ?? "pending";

    if (status === "all") {
      const { rows } = await pool.query(
        `SELECT id, name, message, created_at
           FROM entries
          ORDER BY created_at DESC
          LIMIT 200`,
      );
      return { entries: rows.map(serialize) };
    }

    if (!STATUSES.includes(status)) {
      return reply
        .code(400)
        .send({ error: `status must be one of: ${STATUSES.join(", ")}, all` });
    }

    const { rows } = await pool.query(
      `SELECT id, name, message, created_at
         FROM entries
        WHERE status = $1
        ORDER BY created_at DESC
        LIMIT 200`,
      [status],
    );
    return { entries: rows.map(serialize) };
  },
);

app.post(
  "/admin/entries/:id/approve",
  { preHandler: requireToken(ADMIN_TOKEN) },
  async (request, reply) => {
    const id = parseId(request.params.id);
    if (id === null) return reply.code(400).send({ error: "invalid id" });

    const { rowCount } = await pool.query(
      `UPDATE entries SET status = 'approved' WHERE id = $1`,
      [id],
    );
    if (rowCount === 0) return reply.code(404).send({ error: "not found" });
    return { ok: true };
  },
);

app.delete(
  "/admin/entries/:id",
  { preHandler: requireToken(ADMIN_TOKEN) },
  async (request, reply) => {
    const id = parseId(request.params.id);
    if (id === null) return reply.code(400).send({ error: "invalid id" });

    const { rowCount } = await pool.query(`DELETE FROM entries WHERE id = $1`, [
      id,
    ]);
    if (rowCount === 0) return reply.code(404).send({ error: "not found" });
    return { ok: true };
  },
);

// --- lifecycle -------------------------------------------------------------

const shutdown = async () => {
  await app.close();
  await pool.end();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

await app.listen({ host: "0.0.0.0", port: PORT });
