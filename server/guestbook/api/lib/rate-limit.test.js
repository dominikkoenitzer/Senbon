import { describe, expect, it } from "vitest";

import { UNKNOWN_IP_BUCKET, visitorBucket } from "./rate-limit.js";

describe("visitorBucket", () => {
  it("uses the forwarded address when there is one", () => {
    expect(visitorBucket("203.0.113.7")).toBe("203.0.113.7");
  });

  it("trims surrounding whitespace", () => {
    expect(visitorBucket("  203.0.113.7  ")).toBe("203.0.113.7");
  });

  it("takes the first value when the header arrives repeated", () => {
    expect(visitorBucket(["203.0.113.7", "198.51.100.2"])).toBe("203.0.113.7");
  });

  // The fail-closed property. A missing header must not disable rate limiting:
  // that failed open once and let an unlimited stream of signatures through.
  it("falls back to the shared bucket rather than an empty key", () => {
    expect(visitorBucket(undefined)).toBe(UNKNOWN_IP_BUCKET);
    expect(visitorBucket(null)).toBe(UNKNOWN_IP_BUCKET);
    expect(visitorBucket("")).toBe(UNKNOWN_IP_BUCKET);
    expect(visitorBucket("   ")).toBe(UNKNOWN_IP_BUCKET);
    expect(visitorBucket([])).toBe(UNKNOWN_IP_BUCKET);
    expect(visitorBucket(42)).toBe(UNKNOWN_IP_BUCKET);
    expect(visitorBucket({})).toBe(UNKNOWN_IP_BUCKET);
  });

  it("never returns an empty string", () => {
    for (const input of [undefined, null, "", "  ", [], [""], 0, false, {}]) {
      expect(visitorBucket(input)).not.toBe("");
    }
  });

  it("puts every address-less caller in the same bucket", () => {
    expect(visitorBucket(undefined)).toBe(visitorBucket(""));
  });
});
