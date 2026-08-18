// Text normalisation shared by the moderation checks. Pure string in, string
// out -- no request, no database, no environment.

const SPACE = 32;
const DEL = 127;

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

export { SPACE, DEL, INVISIBLE_CODE_POINTS, clean, lettersOnly, wordTokens, collapseRuns };
