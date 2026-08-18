import { describe, expect, it } from "vitest";

import { parseId, serialize } from "./validation.js";

describe("parseId", () => {
  it("accepts a positive integer", () => {
    expect(parseId("1")).toBe(1);
    expect(parseId("4200")).toBe(4200);
    expect(parseId(7)).toBe(7);
  });

  it("rejects anything that is not all digits", () => {
    // These are the shapes that used to reach Postgres and surface a driver
    // error verbatim.
    expect(parseId("1; DROP TABLE entries")).toBeNull();
    expect(parseId("abc")).toBeNull();
    expect(parseId("1e3")).toBeNull();
    expect(parseId("0x10")).toBeNull();
    expect(parseId(" 1")).toBeNull();
    expect(parseId("1.0")).toBeNull();
    expect(parseId("-1")).toBeNull();
    expect(parseId("")).toBeNull();
    expect(parseId(undefined)).toBeNull();
    expect(parseId(null)).toBeNull();
  });

  it("rejects zero", () => {
    expect(parseId("0")).toBeNull();
  });

  it("rejects an integer too large to represent exactly", () => {
    expect(parseId("9007199254740993")).toBeNull();
  });
});

describe("serialize", () => {
  it("maps a row to the public shape", () => {
    const row = {
      id: 12n,
      name: "Ada",
      message: "Hello",
      status: "approved",
      created_at: new Date("2026-01-02T03:04:05.000Z"),
    };

    expect(serialize(row)).toEqual({
      id: "12",
      name: "Ada",
      message: "Hello",
      signedAt: "2026-01-02T03:04:05.000Z",
      status: "approved",
    });
  });

  it("stringifies the id, since BIGSERIAL overflows a JS number", () => {
    const row = {
      id: 9007199254740993n,
      name: "Ada",
      message: "Hello",
      status: "pending",
      created_at: new Date(0),
    };

    expect(serialize(row).id).toBe("9007199254740993");
  });

  it("does not carry the ip hash into the response", () => {
    const row = {
      id: 1,
      name: "Ada",
      message: "Hello",
      status: "approved",
      ip_hash: "deadbeef",
      created_at: new Date(0),
    };

    expect(serialize(row)).not.toHaveProperty("ip_hash");
    expect(Object.keys(serialize(row)).sort()).toEqual([
      "id",
      "message",
      "name",
      "signedAt",
      "status",
    ]);
  });
});
