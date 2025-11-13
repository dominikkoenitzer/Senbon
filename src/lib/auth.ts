const ADMIN_TOKEN = process.env.GUESTBOOK_ADMIN_TOKEN || process.env.ADMIN_TOKEN;

export const isAdminTokenValid = (token?: string | null) => {
  if (!ADMIN_TOKEN) return false;
  return token === ADMIN_TOKEN;
};
