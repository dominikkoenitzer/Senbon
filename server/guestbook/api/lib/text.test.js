import { describe, expect, it } from "vitest";

import { clean, collapseRuns, lettersOnly, wordTokens } from "./text.js";

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
    expect(clean(`del\u007fhere`)).toBe("del here");
  });

  it("strips zero-width characters so they cannot hide inside a word", () => {
    // The documented evasion: "http<ZWSP>s://" must not survive as a link the
    // spam filter then fails to see.
    expect(clean("http\u200bs://spam.example")).toBe("https://spam.example");
    expect(clean("a\u200cb\u200dc\ufeffd")).toBe("abcd");
  });

  it("strips bidirectional control characters (trojan-source style reordering)", () => {
    expect(clean("safe\u202etxet")).toBe("safetxet");
    expect(clean("\u2066a\u2067b\u2068c\u2069")).toBe("abc");
  });

  it("normalises compatibility forms to NFKC", () => {
    // Fullwidth latin and a ligature both fold to plain ASCII, so a signature
    // cannot dodge a filter by changing script.
    expect(clean("ｈｔｔｐｓ")).toBe("https");
    expect(clean("\ufb01n")).toBe("fin");
  });

  it("leaves ordinary text alone", () => {
    expect(clean("Grüße aus Zürich!")).toBe("Grüße aus Zürich!");
    expect(clean("emoji 👋 survive")).toBe("emoji 👋 survive");
  });
});

describe("lettersOnly", () => {
  it("keeps only lowercase a-z", () => {
    expect(lettersOnly("Hello, World! 123")).toBe("helloworld");
    expect(lettersOnly("123")).toBe("");
  });
});

describe("wordTokens", () => {
  it("splits on non-letters so word boundaries survive", () => {
    expect(wordTokens("a chink in the armour")).toEqual([
      "a",
      "chink",
      "in",
      "the",
      "armour",
    ]);
  });

  it("drops empty tokens", () => {
    expect(wordTokens("  --  ")).toEqual([]);
    expect(wordTokens("one!!!two")).toEqual(["one", "two"]);
  });
});

describe("collapseRuns", () => {
  it("collapses any run of repeats down to one character", () => {
    expect(collapseRuns("niiiigger")).toBe("niger");
    expect(collapseRuns("aaa")).toBe("a");
  });

  it("leaves text with no repeated run unchanged", () => {
    expect(collapseRuns("retard")).toBe("retard");
  });
});
