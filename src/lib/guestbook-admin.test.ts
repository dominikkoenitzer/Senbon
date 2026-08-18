import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createHmac } from "node:crypto";

/**
 * The module reads its credentials at import time and keeps the sign-in
 * throttle in module-level state, so every test imports a fresh copy with the
 * environment it wants.
 */
const cookieStore = new Map<string, string>();
let requestHeaders = new Headers();

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      cookieStore.has(name) ? { name, value: cookieStore.get(name) } : undefined,
    set: (name: string, value: string) => cookieStore.set(name, value),
    delete: (name: string) => cookieStore.delete(name),
  }),
  headers: async () => requestHeaders,
}));

const PASSWORD = "correct-horse";
const TOKEN = "admin-token-value";

const load = async (
  env: { password?: string; token?: string } = {
    password: PASSWORD,
    token: TOKEN,
  },
) => {
  vi.resetModules();
  cookieStore.clear();
  requestHeaders = new Headers();

  if (env.password === undefined) delete process.env.GUESTBOOK_ADMIN_PASSWORD;
  else process.env.GUESTBOOK_ADMIN_PASSWORD = env.password;

  if (env.token === undefined) delete process.env.GUESTBOOK_ADMIN_TOKEN;
  else process.env.GUESTBOOK_ADMIN_TOKEN = env.token;

  return import("./guestbook-admin");
};

afterEach(() => {
  vi.useRealTimers();
});

describe("isAdminConfigured", () => {
  it("is true only when both secrets are present", async () => {
    expect((await load()).isAdminConfigured()).toBe(true);
    expect((await load({ password: PASSWORD })).isAdminConfigured()).toBe(false);
    expect((await load({ token: TOKEN })).isAdminConfigured()).toBe(false);
    expect((await load({})).isAdminConfigured()).toBe(false);
  });
});

describe("passwordMatches", () => {
  it("accepts the configured password", async () => {
    const { passwordMatches } = await load();
    expect(passwordMatches(PASSWORD)).toBe(true);
  });

  it("rejects a wrong password", async () => {
    const { passwordMatches } = await load();
    expect(passwordMatches("wrong")).toBe(false);
    expect(passwordMatches(PASSWORD.toUpperCase())).toBe(false);
    expect(passwordMatches(PASSWORD + " ")).toBe(false);
  });

  it("rejects an empty candidate", async () => {
    const { passwordMatches } = await load();
    expect(passwordMatches("")).toBe(false);
  });

  it("rejects everything when no password is configured", async () => {
    // Otherwise an unconfigured deploy would accept "" as the password.
    const { passwordMatches } = await load({ token: TOKEN });
    expect(passwordMatches("")).toBe(false);
    expect(passwordMatches("anything")).toBe(false);
  });
});

describe("the session cookie", () => {
  it("is an HMAC over a fixed label, keyed by the admin token", async () => {
    const { startSession, SESSION_COOKIE } = await load();
    await startSession();

    const expected = createHmac("sha256", TOKEN)
      .update("senbon-admin-v1")
      .digest("hex");

    expect(cookieStore.get(SESSION_COOKIE)).toBe(expected);
  });

  it("carries no information about the credentials", async () => {
    const { startSession, SESSION_COOKIE } = await load();
    await startSession();

    const value = cookieStore.get(SESSION_COOKIE) ?? "";
    expect(value).not.toContain(PASSWORD);
    expect(value).not.toContain(TOKEN);
  });

  it("admits a holder of the real cookie", async () => {
    const { startSession, isSignedIn } = await load();
    await startSession();
    expect(await isSignedIn()).toBe(true);
  });

  it("rejects a forged or absent cookie", async () => {
    const { isSignedIn, SESSION_COOKIE } = await load();

    expect(await isSignedIn()).toBe(false);

    cookieStore.set(SESSION_COOKIE, "forged");
    expect(await isSignedIn()).toBe(false);

    cookieStore.set(SESSION_COOKIE, "");
    expect(await isSignedIn()).toBe(false);
  });

  it("cannot be forged without the token", async () => {
    const { isSignedIn, SESSION_COOKIE } = await load();

    // The attacker knows the label and the algorithm, but guesses the key.
    cookieStore.set(
      SESSION_COOKIE,
      createHmac("sha256", "guessed-token")
        .update("senbon-admin-v1")
        .digest("hex"),
    );

    expect(await isSignedIn()).toBe(false);
  });

  it("is invalidated by rotating the admin token", async () => {
    const first = await load();
    await first.startSession();
    const issued = cookieStore.get(first.SESSION_COOKIE) as string;

    const rotated = await load({ password: PASSWORD, token: "rotated-token" });
    cookieStore.set(rotated.SESSION_COOKIE, issued);

    expect(await rotated.isSignedIn()).toBe(false);
  });

  it("refuses to admit anyone when admin is unconfigured", async () => {
    const { isSignedIn, SESSION_COOKIE } = await load({ password: PASSWORD });

    // An unkeyed HMAC is computable by anyone, so the configuration check has
    // to run before the comparison.
    cookieStore.set(
      SESSION_COOKIE,
      createHmac("sha256", "").update("senbon-admin-v1").digest("hex"),
    );

    expect(await isSignedIn()).toBe(false);
  });

  it("is dropped by endSession", async () => {
    const { startSession, endSession, isSignedIn } = await load();
    await startSession();
    await endSession();
    expect(await isSignedIn()).toBe(false);
  });
});

describe("signInClientKey", () => {
  it("does not contain the raw address", async () => {
    const { signInClientKey } = await load();
    requestHeaders = new Headers({ "x-forwarded-for": "203.0.113.7" });

    const key = await signInClientKey();

    expect(key).not.toContain("203.0.113.7");
    expect(key).toMatch(/^[0-9a-f]{64}$/);
  });

  it("gives the same client the same key", async () => {
    const { signInClientKey } = await load();
    requestHeaders = new Headers({ "x-forwarded-for": "203.0.113.7" });

    expect(await signInClientKey()).toBe(await signInClientKey());
  });

  it("separates different clients", async () => {
    const { signInClientKey } = await load();

    requestHeaders = new Headers({ "x-forwarded-for": "203.0.113.7" });
    const first = await signInClientKey();

    requestHeaders = new Headers({ "x-forwarded-for": "198.51.100.2" });
    expect(await signInClientKey()).not.toBe(first);
  });

  it("takes the first entry of a forwarded chain", async () => {
    const { signInClientKey } = await load();

    requestHeaders = new Headers({
      "x-forwarded-for": "203.0.113.7, 70.41.3.18",
    });
    const chained = await signInClientKey();

    requestHeaders = new Headers({ "x-forwarded-for": "203.0.113.7" });
    expect(chained).toBe(await signInClientKey());
  });

  it("falls back to x-real-ip", async () => {
    const { signInClientKey } = await load();

    requestHeaders = new Headers({ "x-real-ip": "203.0.113.7" });
    const viaReal = await signInClientKey();

    requestHeaders = new Headers({ "x-forwarded-for": "203.0.113.7" });
    expect(viaReal).toBe(await signInClientKey());
  });

  // Fails closed: a request with no usable address shares one bucket rather
  // than skipping the throttle.
  it("still returns a key when no address header is present", async () => {
    const { signInClientKey } = await load();
    requestHeaders = new Headers();

    const key = await signInClientKey();

    expect(key).toMatch(/^[0-9a-f]{64}$/);
    expect(await signInClientKey()).toBe(key);
  });

  it("puts every address-less caller in the same bucket", async () => {
    const { signInClientKey } = await load();

    requestHeaders = new Headers();
    const missing = await signInClientKey();

    requestHeaders = new Headers({ "x-forwarded-for": "   " });
    expect(await signInClientKey()).toBe(missing);
  });
});

describe("the sign-in throttle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
  });

  const fail = (
    mod: { recordFailedSignIn: (key: string) => void },
    key: string,
    times: number,
  ) => {
    for (let i = 0; i < times; i += 1) mod.recordFailedSignIn(key);
  };

  it("lets an unknown client through", async () => {
    const { signInBlockedFor } = await load();
    expect(signInBlockedFor("client")).toBe(0);
  });

  it("allows five wrong guesses before it bites", async () => {
    const mod = await load();
    fail(mod, "client", 5);
    expect(mod.signInBlockedFor("client")).toBe(0);
  });

  it("blocks on the sixth", async () => {
    const mod = await load();
    fail(mod, "client", 6);
    expect(mod.signInBlockedFor("client")).toBe(20_000);
  });

  it("doubles the wait for each further failure", async () => {
    const mod = await load();
    fail(mod, "client", 6);
    expect(mod.signInBlockedFor("client")).toBe(20_000);

    fail(mod, "client", 1);
    expect(mod.signInBlockedFor("client")).toBe(40_000);

    fail(mod, "client", 1);
    expect(mod.signInBlockedFor("client")).toBe(80_000);
  });

  it("caps the backoff at fifteen minutes", async () => {
    const mod = await load();
    fail(mod, "client", 40);
    expect(mod.signInBlockedFor("client")).toBe(15 * 60 * 1000);
  });

  it("counts down as time passes", async () => {
    const mod = await load();
    fail(mod, "client", 6);

    vi.advanceTimersByTime(5_000);
    expect(mod.signInBlockedFor("client")).toBe(15_000);

    vi.advanceTimersByTime(15_000);
    expect(mod.signInBlockedFor("client")).toBe(0);
  });

  it("throttles each client separately", async () => {
    const mod = await load();
    fail(mod, "noisy", 6);

    expect(mod.signInBlockedFor("noisy")).toBeGreaterThan(0);
    expect(mod.signInBlockedFor("quiet")).toBe(0);
  });

  it("forgets a client after a quiet ten minutes", async () => {
    const mod = await load();
    fail(mod, "client", 5);

    vi.advanceTimersByTime(10 * 60 * 1000 + 1);

    // The window has lapsed, so the count restarts rather than resuming at 5.
    fail(mod, "client", 5);
    expect(mod.signInBlockedFor("client")).toBe(0);
  });

  it("never forgets a record while it is still serving a block", async () => {
    const mod = await load();
    fail(mod, "client", 20);

    // The backoff here outlives the ten-minute attempt window; expiring the
    // record early would hand the client a clean slate mid-block.
    vi.advanceTimersByTime(10 * 60 * 1000 + 1);
    expect(mod.signInBlockedFor("client")).toBeGreaterThan(0);
  });

  it("wipes a client's history on a correct password", async () => {
    const mod = await load();
    fail(mod, "client", 8);
    expect(mod.signInBlockedFor("client")).toBeGreaterThan(0);

    mod.clearSignInAttempts("client");
    expect(mod.signInBlockedFor("client")).toBe(0);
  });

  it("keeps a blocked client blocked as new clients arrive", async () => {
    // The tracker is bounded at 512 entries; eviction must not become a way to
    // clear an active block by spraying forged addresses.
    const mod = await load();
    fail(mod, "victim", 10);
    const before = mod.signInBlockedFor("victim");
    expect(before).toBeGreaterThan(0);

    for (let i = 0; i < 600; i += 1) mod.recordFailedSignIn("spray-" + i);

    expect(mod.signInBlockedFor("victim")).toBe(before);
  });
});
