import { describe, expect, it } from "vitest";

import { clean } from "./text.js";
import { hasBlockedWord, isMashed, looksLikeSpam } from "./moderation.js";

describe("looksLikeSpam", () => {
  it("catches plain links", () => {
    expect(looksLikeSpam("visit https://spam.example")).toBe(true);
    expect(looksLikeSpam("http://spam.example")).toBe(true);
    expect(looksLikeSpam("www.spam.example")).toBe(true);
  });

  it("catches markup that smuggles a link", () => {
    expect(looksLikeSpam("[url=x]click[/url]")).toBe(true);
    expect(looksLikeSpam('<a href="x">click</a>')).toBe(true);
    expect(looksLikeSpam("href = x")).toBe(true);
  });

  it("catches the obfuscations that beat a bare protocol match", () => {
    expect(looksLikeSpam("spam[dot]com")).toBe(true);
    expect(looksLikeSpam("spam dot com")).toBe(true);
    expect(looksLikeSpam("spam (.) com")).toBe(true);
    expect(looksLikeSpam("spam . com")).toBe(true);
  });

  it("catches whitespace inserted into the protocol", () => {
    expect(looksLikeSpam("https:  //spam.example")).toBe(true);
    expect(looksLikeSpam("www .  spam")).toBe(true);
  });

  it("sees through zero-width evasion once the text has been cleaned", () => {
    // A zero-width space between a domain and its dot defeats this filter on
    // its own -- clean() runs first in the request path, and the pair is what
    // holds the line.
    expect(looksLikeSpam("spam\u200b.com")).toBe(false);
    expect(looksLikeSpam(clean("spam\u200b.com"))).toBe(true);

    expect(looksLikeSpam("www\u200b.spam")).toBe(false);
    expect(looksLikeSpam(clean("www\u200b.spam"))).toBe(true);
  });

  it("leaves ordinary signatures alone", () => {
    expect(looksLikeSpam("Lovely site, thanks for sharing.")).toBe(false);
    expect(looksLikeSpam("Greetings from Zurich!")).toBe(false);
    expect(looksLikeSpam("I read it end to end. Well done.")).toBe(false);
  });

  it("does not fire on ordinary prose containing a listed TLD as a word", () => {
    expect(looksLikeSpam("I work in dev and design")).toBe(false);
    expect(looksLikeSpam("the app is great")).toBe(false);
  });
});

describe("hasBlockedWord", () => {
  it("blocks the unambiguous slurs", () => {
    expect(hasBlockedWord("nigger")).toBe(true);
    expect(hasBlockedWord("faggot")).toBe(true);
    expect(hasBlockedWord("tranny")).toBe(true);
  });

  it("blocks them when spaced out or padded", () => {
    expect(hasBlockedWord("n i g g e r")).toBe(true);
    expect(hasBlockedWord("niiiigger")).toBe(true);
    expect(hasBlockedWord("nnnigger")).toBe(true);
  });

  it("blocks them mid-sentence", () => {
    expect(hasBlockedWord("you are a faggot honestly")).toBe(true);
  });

  it("blocks the short slurs used as whole words", () => {
    expect(hasBlockedWord("coon")).toBe(true);
    expect(hasBlockedWord("that retard")).toBe(true);
    expect(hasBlockedWord("fag")).toBe(true);
    expect(hasBlockedWord("chinky")).toBe(true);
  });

  it("blocks stretched short slurs", () => {
    expect(hasBlockedWord("retaaard")).toBe(true);
  });

  // The Scunthorpe regressions this split exists to fix. Each of these was a
  // live 422 on a perfectly innocent signature.
  it("does not fire inside innocent words that merely contain the letters", () => {
    expect(hasBlockedWord("raccoon")).toBe(false);
    expect(hasBlockedWord("cocoon")).toBe(false);
    expect(hasBlockedWord("retardant")).toBe(false);
    expect(hasBlockedWord("a chink in the armour")).toBe(false);
    expect(hasBlockedWord("chinks of light")).toBe(false);
  });

  it("does not fire on ordinary words that collapse onto a slur's skeleton", () => {
    // collapseRuns("coons") === "cons", which must not reject these.
    expect(hasBlockedWord("cons")).toBe(false);
    expect(hasBlockedWord("the pros and cons")).toBe(false);
    expect(hasBlockedWord("control")).toBe(false);
    expect(hasBlockedWord("contact")).toBe(false);
    expect(hasBlockedWord("second confirm")).toBe(false);
  });

  it("returns false for text with no letters at all", () => {
    expect(hasBlockedWord("123 456")).toBe(false);
    expect(hasBlockedWord("")).toBe(false);
  });

  it("passes ordinary signatures", () => {
    expect(hasBlockedWord("Great work, congratulations!")).toBe(false);
    expect(hasBlockedWord("Schöne Grüsse aus der Schweiz")).toBe(false);
  });
});

describe("isMashed", () => {
  it("catches long runs of one character", () => {
    expect(isMashed("aaaaaaaaaa")).toBe(true);
    expect(isMashed("hi!!!!!!!!!!!!")).toBe(true);
  });

  it("catches a short unit repeated", () => {
    expect(isMashed("asdfasdfasdf")).toBe(true);
    expect(isMashed("qwertyqwertyqwerty")).toBe(true);
    expect(isMashed("abababababab")).toBe(true);
  });

  it("catches low-variety text once it is long enough to judge", () => {
    expect(isMashed("aaabbbaaabbbaaabbbaaabbb")).toBe(true);
  });

  it("leaves short messages alone", () => {
    expect(isMashed("hi")).toBe(false);
    expect(isMashed("thanks!")).toBe(false);
    expect(isMashed("nice one")).toBe(false);
  });

  // The regression the capped denominator fixes: distinct characters do not
  // scale with length, so a genuine long message used to land near 0.16 and be
  // rejected. Every thoughtful signature near the 280-character cap was blocked.
  it("accepts a genuine message near the length cap", () => {
    const long =
      "I found this site through a link on a forum and ended up reading the " +
      "whole journal in one sitting. The piece about building things slowly " +
      "stayed with me all week, so thank you for writing it down and leaving " +
      "it up for strangers to find.";
    expect(long.length).toBeGreaterThan(200);
    expect(isMashed(long)).toBe(false);
  });

  it("accepts a message that is long but plainly written", () => {
    expect(isMashed("thank you for putting this together, it helped a lot")).toBe(
      false,
    );
  });
});
