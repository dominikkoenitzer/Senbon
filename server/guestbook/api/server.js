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

/**
 * Visitor IPs are hashed, never stored raw. The caller (the Next.js server
 * action) forwards the real client IP, since the request itself originates
 * from Vercel's infrastructure.
 */
const hashIp = (ip) =>
  ip ? createHmac("sha256", IP_HASH_SALT).update(ip).digest("hex") : null;

/**
 * Drop control characters (they only ever arrive from bots or paste
 * accidents), then collapse whitespace runs.
 */
const clean = (value) => {
  if (typeof value !== "string") return "";
  const printable = Array.from(value)
    .map((char) => {
      const code = char.charCodeAt(0);
      return code < SPACE || code === DEL ? " " : char;
    })
    .join("");
  return printable.replace(/\s+/g, " ").trim();
};

const looksLikeSpam = (text) => /https?:\/\/|www\.|\[url|<a\s/i.test(text);

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

    const ipHash = hashIp(request.headers["x-visitor-ip"]);

    if (ipHash && RATE_LIMIT_SECONDS > 0) {
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
  async (request) => {
    const status = request.query?.status ?? "pending";
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
    const { rowCount } = await pool.query(
      `UPDATE entries SET status = 'approved' WHERE id = $1`,
      [request.params.id],
    );
    if (rowCount === 0) return reply.code(404).send({ error: "not found" });
    return { ok: true };
  },
);

app.delete(
  "/admin/entries/:id",
  { preHandler: requireToken(ADMIN_TOKEN) },
  async (request, reply) => {
    const { rowCount } = await pool.query(`DELETE FROM entries WHERE id = $1`, [
      request.params.id,
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
