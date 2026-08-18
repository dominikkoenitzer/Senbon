// Request-shape validation and row serialisation.

/** Reject anything that is not a positive integer before it reaches Postgres. */
const parseId = (raw) => {
  if (!/^\d+$/.test(String(raw))) return null;
  const id = Number(raw);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

const serialize = (row) => ({
  id: String(row.id),
  name: row.name,
  message: row.message,
  signedAt: row.created_at.toISOString(),
  status: row.status,
});

export { parseId, serialize };
