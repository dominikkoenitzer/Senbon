import { describe, expect, it } from "vitest";

import { bearerToken, requireToken, safeEqual } from "./auth.js";

describe("safeEqual", () => {
  it("accepts an exact match", () => {
    expect(safeEqual("s3cret", "s3cret")).toBe(true);
  });

  it("rejects a mismatch of the same length", () => {
    expect(safeEqual("s3cret", "s3cres")).toBe(false);
  });

  it("rejects unequal lengths without throwing", () => {
    // node's timingSafeEqual throws on length mismatch; the guard is the point.
    expect(() => safeEqual("short", "much longer secret")).not.toThrow();
    expect(safeEqual("short", "much longer secret")).toBe(false);
  });

  it("rejects empty input on both sides", () => {
    // Two empty strings are equal-length and would otherwise compare true,
    // which would let a request with no token through when none is configured.
    expect(safeEqual("", "")).toBe(false);
    expect(safeEqual("", "secret")).toBe(false);
    expect(safeEqual("secret", "")).toBe(false);
  });

  it("coerces non-strings rather than throwing", () => {
    expect(safeEqual(undefined, "secret")).toBe(false);
    expect(safeEqual(null, undefined)).toBe(false);
    expect(safeEqual(123, "123")).toBe(true);
  });
});

describe("bearerToken", () => {
  it("extracts the token after the scheme", () => {
    expect(bearerToken({ headers: { authorization: "Bearer abc123" } })).toBe(
      "abc123",
    );
  });

  it("returns an empty string when the header is missing", () => {
    expect(bearerToken({ headers: {} })).toBe("");
  });

  it("returns an empty string for another scheme", () => {
    expect(bearerToken({ headers: { authorization: "Basic abc123" } })).toBe("");
  });

  it("is case-sensitive about the scheme", () => {
    expect(bearerToken({ headers: { authorization: "bearer abc123" } })).toBe("");
  });

  it("does not strip a token that merely contains spaces", () => {
    expect(bearerToken({ headers: { authorization: "Bearer a b" } })).toBe("a b");
  });
});

const fakeReply = () => {
  const reply = {
    statusCode: null,
    body: null,
    code(status) {
      reply.statusCode = status;
      return reply;
    },
    send(payload) {
      reply.body = payload;
      return reply;
    },
  };
  return reply;
};

describe("requireToken", () => {
  it("passes a request carrying the expected token", async () => {
    const reply = fakeReply();
    const guard = requireToken("expected-token");

    await guard({ headers: { authorization: "Bearer expected-token" } }, reply);

    expect(reply.statusCode).toBeNull();
  });

  it("401s a request with the wrong token", async () => {
    const reply = fakeReply();
    const guard = requireToken("expected-token");

    await guard({ headers: { authorization: "Bearer wrong-token" } }, reply);

    expect(reply.statusCode).toBe(401);
    expect(reply.body).toEqual({ error: "unauthorized" });
  });

  it("401s a request with no authorization header at all", async () => {
    const reply = fakeReply();
    const guard = requireToken("expected-token");

    await guard({ headers: {} }, reply);

    expect(reply.statusCode).toBe(401);
  });

  it("401s every request when the expected token is empty", async () => {
    // A misconfigured deploy must lock the door, not leave it open.
    const reply = fakeReply();
    const guard = requireToken("");

    await guard({ headers: { authorization: "Bearer " } }, reply);

    expect(reply.statusCode).toBe(401);
  });

  it("does not leak which part was wrong", async () => {
    const reply = fakeReply();
    await requireToken("expected-token")(
      { headers: { authorization: "Basic expected-token" } },
      reply,
    );

    expect(reply.body).toEqual({ error: "unauthorized" });
  });
});
