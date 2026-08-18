import { createHmac } from "node:crypto";

import Fastify from "fastify";
import pg from "pg";

import { requireToken } from "./lib/auth.js";
import { clean } from "./lib/text.js";
import { hasBlockedWord, isMashed, looksLikeSpam } from "./lib/moderation.js";
import { visitorBucket } from "./lib/rate-limit.js";
import { parseId, serialize } from "./lib/validation.js";

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

const STATUSES = ["pending", "approved", "rejected"];

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
 * Never let a raw driver error reach the client -- a bad :id used to surface the
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

const hmac = (value) =>
  createHmac("sha256", IP_HASH_SALT).update(value).digest("hex");

const rateLimitKey = (request) =>
  hmac(visitorBucket(request.headers["x-visitor-ip"]));

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

await pool.query(`
  CREATE TABLE IF NOT EXISTS settings (
    key         TEXT PRIMARY KEY,
    value       TEXT NOT NULL,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
  );
`);

// --- settings (runtime-toggleable auto-approve) -----------------------------

const AUTO_APPROVE_KEY = "auto_approve";

/**
 * Seed from the env var ONLY the first time this key is ever created. Once a
 * human has flipped it from the admin page, the DB row is the source of
 * truth forever -- a redeploy or container restart must not stomp on their
 * choice by re-reading AUTO_APPROVE from the environment.
 */
await pool.query(
  `INSERT INTO settings (key, value, updated_at)
   VALUES ($1, $2, now())
   ON CONFLICT (key) DO NOTHING`,
  [AUTO_APPROVE_KEY, String(AUTO_APPROVE)],
);

/**
 * /sign reads this in-memory value rather than querying Postgres on every
 * signature. It is populated at boot and kept current by setAutoApprove()
 * below, which updates it in the same request that writes the new value --
 * so a toggle from /admin/settings is visible to the very next /sign call
 * with no extra round trip and no polling.
 */
let autoApproveCache = AUTO_APPROVE;

const loadAutoApprove = async () => {
  const { rows } = await pool.query(
    `SELECT value FROM settings WHERE key = $1`,
    [AUTO_APPROVE_KEY],
  );
  autoApproveCache = rows.length > 0 ? rows[0].value === "true" : AUTO_APPROVE;
  return autoApproveCache;
};

const getAutoApprove = () => autoApproveCache;

const setAutoApprove = async (value) => {
  await pool.query(
    `INSERT INTO settings (key, value, updated_at)
     VALUES ($1, $2, now())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at`,
    [AUTO_APPROVE_KEY, String(value)],
  );
  autoApproveCache = value;
};

await loadAutoApprove();

// --- routes ----------------------------------------------------------------

/**
 * Liveness only, and deliberately so. This route is unauthenticated and is
 * polled by docker-compose's healthcheck, which only looks at response.ok --
 * it never reads the body. Querying Postgres here meant anyone who could reach
 * the container could drain a 5-connection pool with a loop of unauthenticated
 * GETs. The database ping lives at /admin/health/db behind the admin token.
 */
app.get("/health", async () => ({ ok: true }));

app.get("/entries", { preHandler: requireToken(API_TOKEN) }, async (request) => {
  const requested = Number(request.query?.limit ?? 50);
  const limit = Number.isFinite(requested)
    ? Math.min(Math.max(Math.trunc(requested), 1), FETCH_LIMIT_MAX)
    : 50;

  const { rows } = await pool.query(
    `SELECT id, name, message, status, created_at
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

    // These strings are read by a human -- the Next.js server action matches on
    // them to pick the copy shown under the sign form, and a direct API caller
    // sees them verbatim. Each one has to name the fix, not just the verdict.
    // Keep the distinguishing words ("keyboard mash", "link", "word", the
    // "name has to be" / "message has to be" prefixes) intact; the action keys
    // off them. Plain ASCII only in this file -- it is deployed by byte copy.
    if (!name || !message) {
      return reply
        .code(400)
        .send({ error: "i need a name and a message. both. that is the whole form." });
    }
    if (name.length > NAME_MAX) {
      return reply.code(400).send({
        error: `name has to be ${NAME_MAX} characters or fewer. cut it down and try again.`,
      });
    }
    if (message.length > MESSAGE_MAX) {
      return reply.code(400).send({
        error: `message has to be ${MESSAGE_MAX} characters or fewer. trim it and send it again.`,
      });
    }
    if (looksLikeSpam(message) || looksLikeSpam(name)) {
      return reply.code(422).send({
        error: "no links. spam bots ruined that for everyone. take the url out and it goes through.",
      });
    }
    if (hasBlockedWord(message) || hasBlockedWord(name)) {
      return reply.code(422).send({
        error: "that word is not going on my wall. you know which one. take it out and try again.",
      });
    }
    if (isMashed(message) || isMashed(name)) {
      return reply.code(422).send({
        error: "that is a keyboard mash and we both know it. give me four real words.",
      });
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
          error: `you just signed. seconds ago. i saw. give it ${RATE_LIMIT_SECONDS} seconds and go again.`,
        });
      }
    }

    const status = getAutoApprove() ? "approved" : "pending";
    const { rows } = await pool.query(
      `INSERT INTO entries (name, message, status, ip_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, message, status, created_at`,
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
        `SELECT id, name, message, status, created_at
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
      `SELECT id, name, message, status, created_at
         FROM entries
        WHERE status = $1
        ORDER BY created_at DESC
        LIMIT 200`,
      [status],
    );
    return { entries: rows.map(serialize) };
  },
);

/** The DB ping that /health used to do, gated so it cannot be used as a tap. */
app.get(
  "/admin/health/db",
  { preHandler: requireToken(ADMIN_TOKEN) },
  async () => {
    await pool.query("SELECT 1");
    return { ok: true, db: "up" };
  },
);

app.get(
  "/admin/settings",
  { preHandler: requireToken(ADMIN_TOKEN) },
  async () => ({ autoApprove: getAutoApprove() }),
);

app.post(
  "/admin/settings",
  { preHandler: requireToken(ADMIN_TOKEN) },
  async (request, reply) => {
    const { autoApprove } = request.body ?? {};
    if (typeof autoApprove !== "boolean") {
      return reply
        .code(400)
        .send({ error: "autoApprove must be a boolean" });
    }
    await setAutoApprove(autoApprove);
    return { ok: true, autoApprove };
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
