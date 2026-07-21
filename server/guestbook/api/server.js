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
 * A missing header must NOT disable rate limiting -- that failed open and let an
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
 * bare protocol match -- "spam[dot]com", "spam dot com", "spam (.) com".
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

/**
 * Slur blocklist, in two halves.
 *
 * The split exists because a single aggressive list produced the Scunthorpe
 * problem in its purest form. Matching used to run only on a letters-only
 * projection of the text, which deletes every space, so "coon" matched inside
 * "raccoon" and "cocoon", "retard" inside "retardant", and "chink" inside the
 * ordinary idiom "a chink in the armour". Those were live 422s on perfectly
 * innocent signatures.
 *
 * BLOCKED_SUBSTRINGS holds the long, unambiguous slurs -- strings that do not
 * occur inside any innocent English word. They keep the aggressive treatment:
 * substring match against the space-stripped projection plus the collapsed-runs
 * comparison, so "n i g g e r" and "niiiigger" are both still caught.
 *
 * BLOCKED_TOKENS holds the short or ambiguous ones. They are matched only as
 * WHOLE WORDS against a tokenised copy of the original text, so the slur used
 * as a slur is rejected while the innocent word that merely contains those
 * letters goes through.
 *
 * Neither list will ever be complete -- moderation is the real backstop. This
 * exists so the worst material cannot sit on the public wall in the seconds
 * before a human sees it.
 */
const BLOCKED_SUBSTRINGS = [
  "nigger",
  "nigga",
  "faggot",
  "tranny",
  "kike",
  "wetback",
  "beaner",
  "raghead",
];

/**
 * Whole-word only. Plurals and -ed / -ing forms are listed explicitly rather
 * than stemmed, because a stemmer would reintroduce exactly the substring
 * bleed this list exists to avoid.
 *
 * Deliberately absent: bare "chink" and "chinks". They are ordinary English
 * nouns ("a chink in the armour", "chinks of light") and blocking them as
 * whole words rejects a common idiom, which is one of the confirmed false
 * positives this change is fixing. "chinky" stays, since it has no innocent
 * reading.
 */
const BLOCKED_TOKENS = [
  "fag",
  "fags",
  "fagged",
  "fagging",
  "coon",
  "coons",
  "spic",
  "spics",
  "gook",
  "gooks",
  "chinky",
  "retard",
  "retards",
  "retarded",
  "retarding",
];

const lettersOnly = (text) => text.toLowerCase().replace(/[^a-z]/g, "");

/** Lowercase, non-letters to spaces, split -- so word boundaries survive. */
const wordTokens = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z]+/g, " ")
    .split(" ")
    .filter(Boolean);

/** Collapse every run of 2-or-more repeated letters down to one. */
const collapseRuns = (text) => text.replace(/(.)\1+/g, "$1");

/**
 * Below this length, a collapsed blocklist word stops being a safe match
 * target: "coon" and "gook" both collapse to a 3-letter skeleton ("con",
 * "gok"), and "con" alone is a substring of "control", "contact", "second",
 * "confirm" and countless other ordinary words -- comparing against it would
 * reject huge amounts of normal conversation. Words at or above this length
 * ("nigger" -> "niger", "faggot" -> "fagot", "nigga" -> "niga", "tranny" ->
 * "trany") stay specific enough to use safely, so they still catch padded
 * evasions like "niiiigger" or "nnnigger" via the collapsed comparison.
 *
 * The same floor guards the whole-word half of the check, where the collapsed
 * comparison is an exact token match rather than a substring one: "retaaard"
 * collapses onto "retard", but a token that collapses to "con" or "gok" is
 * left alone.
 */
const MIN_COLLAPSED_MATCH_LEN = 4;

const hasBlockedWord = (text) => {
  const flat = lettersOnly(text);
  if (!flat) return false;

  const collapsed = collapseRuns(flat);
  const substringHit = BLOCKED_SUBSTRINGS.some((word) => {
    if (flat.includes(word)) return true;
    const collapsedWord = collapseRuns(word);
    return (
      collapsedWord.length >= MIN_COLLAPSED_MATCH_LEN &&
      collapsed.includes(collapsedWord)
    );
  });
  if (substringHit) return true;

  const tokens = wordTokens(text);
  if (tokens.length === 0) return false;

  return tokens.some((token) => {
    if (BLOCKED_TOKENS.includes(token)) return true;
    const collapsedToken = collapseRuns(token);
    // Only stretched tokens ("retaaard") reach the collapsed comparison. A
    // token with no repeated run was already tested literally, and letting it
    // through here would reject ordinary words that happen to be some slur's
    // skeleton -- "cons" is exactly collapseRuns("coons").
    if (collapsedToken === token) return false;
    if (collapsedToken.length < MIN_COLLAPSED_MATCH_LEN) return false;
    return BLOCKED_TOKENS.some((word) => collapseRuns(word) === collapsedToken);
  });
};

/**
 * Keyboard mash and character floods -- "aaaaaaaa...", "asdfasdf". These pass
 * every other check: they contain no links, sit inside the length cap, and are
 * perfectly valid text. They are also the single most common thing a bored
 * visitor types into a public form.
 *
 * Three independent signals:
 *
 * 1. A run of ten or more identical characters.
 * 2. The whole message being one short unit repeated three or more times
 *    ("asdfasdfasdf", "qwertyqwertyqwerty").
 * 3. Too few distinct characters for the length.
 *
 * Signal 3 must NOT divide the distinct-character count by the raw length.
 * Distinct characters do not scale with length -- written English tops out
 * somewhere around 30-40 of them no matter how long the text is -- so the ratio
 * falls steadily as a message gets longer, and a genuine 200-character message
 * landed near 0.16 and was rejected as mash. Every thoughtful signature near
 * the length cap was blocked. Capping the denominator turns the test into what
 * it was always meant to be: an absolute floor on distinct characters (0.18 *
 * 40 = at least 8 of them) for anything long, while short messages are still
 * judged proportionally.
 */
const MIN_LENGTH_FOR_ENTROPY = 24;
const MIN_UNIQUE_RATIO = 0.18;
const UNIQUE_RATIO_DENOMINATOR_MAX = 40;

const MIN_LENGTH_FOR_REPEAT = 12;
/** The entire string is one unit of 1-6 characters, repeated 3 or more times. */
const REPEATED_UNIT = /^(.{1,6}?)\1{2,}$/;

const isMashed = (text) => {
  if (/(.)\1{9,}/.test(text)) return true;

  const dense = text.replace(/\s/g, "").toLowerCase();

  if (dense.length >= MIN_LENGTH_FOR_REPEAT && REPEATED_UNIT.test(dense)) {
    return true;
  }

  if (dense.length < MIN_LENGTH_FOR_ENTROPY) return false;

  const unique = new Set(dense).size;
  const denominator = Math.min(dense.length, UNIQUE_RATIO_DENOMINATOR_MAX);
  return unique / denominator < MIN_UNIQUE_RATIO;
};

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
  status: row.status,
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
