import { describe, expect, it } from "vitest";

import {
  UNKNOWN_VISITOR_BUCKET,
  clean,
  collapseRuns,
  hasBlockedWord,
  isMashed,
  lettersOnly,
  looksLikeSpam,
  visitorBucket,
  wordTokens,
} from "./guestbook-moderation";

describe("clean", () => {
  it("returns an empty string for anything that is not a string", () => {
    expect(clean(undefined)).toBe("");
    expect(clean(null)).toBe("");
    expect(clean(42)).toBe("");
    expect(clean({})).toBe("");
  });

  it("collapses whitespace runs and trims", () => {
    expect(clean("  hello   there  ")).toBe("hello there");
    expect(clean("line\n\nbreak")).toBe("line break");
  });

  it("turns control characters into spaces rather than dropping them", () => {
    // Dropping would silently weld words together: "a\u0007b" must not become "ab".
    expect(clean("a\u0007b")).toBe("a b");
    expect(clean("tab\tseparated")).toBe("tab separated");
    expect(clean("del\u007fhere")).toBe("del here");
  });

  it("strips zero-width characters so they cannot hide inside a word", () => {
    expect(clean("http\u200bs://spam.example")).toBe("https://spam.example");
    expect(clean("a\u200cb\u200dc\ufeffd")).toBe("abcd");
  });

  it("strips bidirectional control characters", () => {
    expect(clean("safe\u202etxet")).toBe("safetxet");
    expect(clean("\u2066a\u2067b\u2068c\u2069")).toBe("abc");
  });

  it("normalises compatibility forms to NFKC", () => {
    expect(clean("ｈｔｔｐｓ")).toBe("https");
    expect(clean("ﬁn")).toBe("fin");
  });

  it("leaves ordinary text alone", () => {
    expect(clean("Grüße aus Zürich!")).toBe("Grüße aus Zürich!");
    expect(clean("emoji 👋 survive")).toBe("emoji 👋 survive");
  });
});

describe("lettersOnly / wordTokens / collapseRuns", () => {
  it("keeps only lowercase a-z", () => {
    expect(lettersOnly("Hello, World! 123")).toBe("helloworld");
    expect(lettersOnly("123")).toBe("");
  });

  it("splits on non-letters so word boundaries survive", () => {
    expect(wordTokens("a chink in the armour")).toEqual([
      "a",
      "chink",
      "in",
      "the",
      "armour",
    ]);
    expect(wordTokens("Hi-there, you!")).toEqual(["hi", "there", "you"]);
  });

  it("collapses repeated runs", () => {
    expect(collapseRuns("niiiigger")).toBe("niger");
    expect(collapseRuns("coons")).toBe("cons");
  });
});

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

  // The Scunthorpe regressions the two-list split exists to fix. Each of these
  // was a live rejection of a perfectly innocent signature.
  it("does not fire inside innocent words that merely contain the letters", () => {
    expect(hasBlockedWord("raccoon")).toBe(false);
    expect(hasBlockedWord("cocoon")).toBe(false);
    expect(hasBlockedWord("retardant")).toBe(false);
    expect(hasBlockedWord("a chink in the armour")).toBe(false);
    expect(hasBlockedWord("chinks of light")).toBe(false);
  });

  it("does not fire on ordinary words that collapse onto a slur's skeleton", () => {
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
  // scale with length, so a genuine long message used to be rejected.
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

describe("visitorBucket", () => {
  it("uses the address when there is one, trimmed", () => {
    expect(visitorBucket("203.0.113.7")).toBe("203.0.113.7");
    expect(visitorBucket("  203.0.113.7  ")).toBe("203.0.113.7");
  });

  // The fail-closed property. A missing address must not disable rate
  // limiting: that failed open once and let an unlimited stream through.
  it("falls back to the shared bucket rather than an empty key", () => {
    for (const input of [undefined, null, "", "   ", 42, {}, []]) {
      expect(visitorBucket(input)).toBe(UNKNOWN_VISITOR_BUCKET);
    }
  });
});
