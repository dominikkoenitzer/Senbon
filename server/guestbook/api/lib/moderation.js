// Content moderation: link/spam heuristics, the slur blocklists, and keyboard
// mash detection. Every export takes already-cleaned text (see lib/text.js).

import { lettersOnly, wordTokens, collapseRuns } from "./text.js";

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

export {
  TLDS,
  LINK_PATTERNS,
  looksLikeSpam,
  BLOCKED_SUBSTRINGS,
  BLOCKED_TOKENS,
  MIN_COLLAPSED_MATCH_LEN,
  hasBlockedWord,
  isMashed,
};
