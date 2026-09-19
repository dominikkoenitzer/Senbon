/**
 * Content checks for the guestbook: text normalisation, link detection, the
 * slur blocklists and keyboard-mash detection. Pure functions, string in and
 * verdict out. No request, no database, no environment, so every one of them
 * is unit-tested in isolation.
 *
 * These used to live behind an HTTP API. They now run inside the sign action,
 * so the length caps in `constants/guestbook.ts` are the only ones there are.
 */

const SPACE = 32;
const DEL = 127;

/**
 * Zero-width and bidirectional-control code points. They are invisible, so they
 * are useless to an honest signer but let an attacker slip past the link filter
 * ("http<ZWSP>s://...") or visually reorder a signature for every other visitor
 * (a trojan-source style trick).
 */
const INVISIBLE_CODE_POINTS = new Set([
  0x200b, 0x200c, 0x200d, 0x200e, 0x200f, 0x2060, 0xfeff, 0x202a, 0x202b,
  0x202c, 0x202d, 0x202e, 0x2066, 0x2067, 0x2068, 0x2069,
]);

/**
 * Drop control characters (bots and paste accidents) and invisible formatting
 * characters (filter evasion and display spoofing), normalise compatibility
 * forms, then collapse whitespace runs.
 */
export const clean = (value: unknown): string => {
  if (typeof value !== "string") return "";
  let out = "";
  for (const char of value.normalize("NFKC")) {
    const code = char.codePointAt(0) ?? 0;
    if (INVISIBLE_CODE_POINTS.has(code)) continue;
    out += code < SPACE || code === DEL ? " " : char;
  }
  return out.replace(/\s+/g, " ").trim();
};

export const lettersOnly = (text: string): string =>
  text.toLowerCase().replace(/[^a-z]/g, "");

/** Lowercase, non-letters to spaces, split, so word boundaries survive. */
export const wordTokens = (text: string): string[] =>
  text
    .toLowerCase()
    .replace(/[^a-z]+/g, " ")
    .split(" ")
    .filter(Boolean);

/** Collapse every run of 2-or-more repeated characters down to one. */
export const collapseRuns = (text: string): string =>
  text.replace(/(.)\1+/g, "$1");

/* ------------------------------------------------------------------------ *
 * Links
 *
 * The obvious forms plus the obfuscations that trivially beat a bare protocol
 * match: "spam[dot]com", "spam dot com", "spam (.) com". A heuristic, and it
 * always will be; a determined spammer can describe a domain in prose. It
 * expects cleaned text, so zero-width evasion is handled upstream in clean().
 * ------------------------------------------------------------------------ */

const TLDS =
  "com|net|org|io|co|de|ch|ru|cn|xyz|top|info|biz|shop|club|online|site|live|link|app|dev|me|tv|cc|pw|casino|bet|loan|work|click|example";

// A bare dot is a domain when it is tight ("spam.com") or spaced on both
// sides ("spam . com"); trailing space alone is just a sentence ending.
const SEPARATOR =
  "(?:\\.|\\s+\\.\\s+|\\s*(?:\\[\\s*dot\\s*\\]|\\(\\s*\\.?\\s*\\)|\\s+dot\\s+)\\s*)";

const LINK_PATTERNS: readonly RegExp[] = [
  /https?:\s*\/\//i,
  /www\s*\./i,
  /\[url|<a\s|href\s*=/i,
  new RegExp(`\\b[a-z0-9][a-z0-9-]*${SEPARATOR}(?:${TLDS})\\b`, "i"),
];

export const looksLikeSpam = (text: string): boolean =>
  LINK_PATTERNS.some((pattern) => pattern.test(text));

/* ------------------------------------------------------------------------ *
 * Slurs, in two halves.
 *
 * The split exists because a single aggressive list produced the Scunthorpe
 * problem in its purest form. Matching used to run only on a letters-only
 * projection of the text, which deletes every space, so "coon" matched inside
 * "raccoon" and "cocoon", "retard" inside "retardant", and "chink" inside the
 * ordinary idiom "a chink in the armour". Those were live rejections of
 * perfectly innocent signatures.
 *
 * BLOCKED_SUBSTRINGS holds the long, unambiguous slurs, strings that do not
 * occur inside any innocent English word. They keep the aggressive treatment:
 * substring match against the space-stripped projection plus the
 * collapsed-runs comparison, so "n i g g e r" and "niiiigger" are both caught.
 *
 * BLOCKED_TOKENS holds the short or ambiguous ones. They are matched only as
 * WHOLE WORDS against a tokenised copy of the original text, so the slur used
 * as a slur is rejected while the innocent word that merely contains those
 * letters goes through.
 *
 * Neither list will ever be complete; moderation is the real backstop. This
 * exists so the worst material cannot sit on the public wall in the seconds
 * before a human sees it.
 * ------------------------------------------------------------------------ */

const BLOCKED_SUBSTRINGS: readonly string[] = [
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
 * nouns ("a chink in the armour", "chinks of light"). "chinky" stays, since it
 * has no innocent reading.
 */
const BLOCKED_TOKENS: readonly string[] = [
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

/**
 * Below this length a collapsed blocklist word stops being a safe match
 * target: "coon" and "gook" both collapse to a 3-letter skeleton ("con",
 * "gok"), and "con" is a substring of "control", "contact", "second",
 * "confirm" and countless other ordinary words. Words at or above this length
 * ("nigger" -> "niger", "faggot" -> "fagot") stay specific enough to use
 * safely, so they still catch padded evasions like "niiiigger".
 */
const MIN_COLLAPSED_MATCH_LEN = 4;

export const hasBlockedWord = (text: string): boolean => {
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
    // skeleton: "cons" is exactly collapseRuns("coons").
    if (collapsedToken === token) return false;
    if (collapsedToken.length < MIN_COLLAPSED_MATCH_LEN) return false;
    return BLOCKED_TOKENS.some((word) => collapseRuns(word) === collapsedToken);
  });
};

/* ------------------------------------------------------------------------ *
 * Keyboard mash and character floods: "aaaaaaaa...", "asdfasdf". These pass
 * every other check and are the single most common thing a bored visitor
 * types into a public form. Three independent signals:
 *
 * 1. A run of ten or more identical characters.
 * 2. The whole message being one short unit repeated three or more times.
 * 3. Too few distinct characters for the length.
 *
 * Signal 3 must NOT divide the distinct-character count by the raw length.
 * Distinct characters do not scale with length (written English tops out
 * around 30-40 of them), so a plain ratio falls as a message gets longer and a
 * genuine 200-character message was rejected as mash. Capping the denominator
 * turns the test into an absolute floor on distinct characters for anything
 * long, while short messages are still judged proportionally.
 * ------------------------------------------------------------------------ */

const MIN_LENGTH_FOR_ENTROPY = 24;
const MIN_UNIQUE_RATIO = 0.18;
const UNIQUE_RATIO_DENOMINATOR_MAX = 40;

const MIN_LENGTH_FOR_REPEAT = 12;
/** The entire string is one unit of 1-6 characters, repeated 3 or more times. */
const REPEATED_UNIT = /^(.{1,6}?)\1{2,}$/;

export const isMashed = (text: string): boolean => {
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

/* ------------------------------------------------------------------------ *
 * Rate-limit bucket
 *
 * Visitor addresses are hashed, never stored raw. A missing address must NOT
 * disable rate limiting: that failed open once and let an unlimited stream of
 * signatures through. Callers without one share a single bucket instead.
 * ------------------------------------------------------------------------ */

export const UNKNOWN_VISITOR_BUCKET = "unknown-visitor";

/** Never returns an empty string: anything unusable collapses onto the shared bucket. */
export const visitorBucket = (address: unknown): string => {
  const trimmed = typeof address === "string" ? address.trim() : "";
  return trimmed || UNKNOWN_VISITOR_BUCKET;
};
