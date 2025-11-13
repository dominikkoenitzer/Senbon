const ADMIN_TOKEN = process.env.GUESTBOOK_ADMIN_TOKEN || process.env.ADMIN_TOKEN;

export const isAdminTokenValid = (token?: string | null) => {
  if (!ADMIN_TOKEN) return false;
  return token === ADMIN_TOKEN;
};

export const extractAdminToken = (request: Request) => {
  const headerToken =
    request.headers.get("x-senbon-admin-token") ??
    request.headers.get("x-admin-token") ??
    request.headers.get("x-api-key");

  if (headerToken) return headerToken;

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.replace("Bearer ", "").trim();
  }

  return null;
};

export const assertAdmin = (request: Request) => {
  const token = extractAdminToken(request);
  if (!isAdminTokenValid(token)) {
    return Response.json(
      { error: "Forbidden — invalid or missing admin token." },
      { status: 403 },
    );
  }
  return null;
};

