// Bearer-token authentication. Kept free of module state so the comparison
// itself can be tested without booting the server.

import { timingSafeEqual } from "node:crypto";

/** Constant-time compare that tolerates unequal lengths without throwing. */
const safeEqual = (a, b) => {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length || left.length === 0) return false;
  return timingSafeEqual(left, right);
};

const bearerToken = (request) => {
  const header = request.headers.authorization ?? "";
  return header.startsWith("Bearer ") ? header.slice(7) : "";
};

const requireToken = (expected) => async (request, reply) => {
  if (!safeEqual(bearerToken(request), expected)) {
    return reply.code(401).send({ error: "unauthorized" });
  }
};

export { safeEqual, bearerToken, requireToken };
