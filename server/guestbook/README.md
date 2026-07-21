# Guestbook API

The self-hosted backend behind `/guestbook`. Runs as a Docker Compose stack on
the VPS at **`/srv/senbon-guestbook`** and is reached over HTTPS through the
shared `caddy-proxy`.

This source is committed deliberately. The previous guestbook backend lived
only on the server, so when its hosting integration went away nothing was
recoverable — the page had to be stubbed out. Keep this directory in sync with
what is deployed.

---

## Shape

```
Vercel (Next.js server action)
        │  HTTPS + bearer token
        ▼
caddy-proxy  ──►  senbon-guestbook-api  ──►  senbon-guestbook-db
 (TLS, shared)     (Fastify, no host port)    (Postgres 16, no host port)
```

Neither container publishes a host port. The only way in is through Caddy,
which routes `senbon.152.53.185.247.sslip.io` to the API over the `senbon_net`
Docker network.

The hostname uses [sslip.io](https://sslip.io), which resolves any
`*.<ip>.sslip.io` name to that IP — so the stack gets a real Let's Encrypt
certificate with **no DNS records to manage**. `senbon.ch` DNS is untouched.

---

## Endpoints

All routes require `Authorization: Bearer <token>`.

| Method   | Path                          | Token | Purpose                          |
| -------- | ----------------------------- | ----- | -------------------------------- |
| `GET`    | `/health`                     | none  | Liveness + DB ping               |
| `GET`    | `/entries?limit=`             | API   | Approved signatures, newest first |
| `POST`   | `/sign`                       | API   | Submit a signature (goes to `pending`) |
| `GET`    | `/admin/entries?status=`      | ADMIN | Moderation queue                 |
| `POST`   | `/admin/entries/:id/approve`  | ADMIN | Publish a signature              |
| `DELETE` | `/admin/entries/:id`          | ADMIN | Remove a signature               |

---

## Moderation

Currently **`AUTO_APPROVE=true`** — signatures publish the moment they are
submitted, and the endpoints below are for cleaning up after the fact rather
than for gating. Set `AUTO_APPROVE=false` and `docker compose up -d` to hold
new entries as `pending` until approved.

```bash
ssh v2202507290292366800.luckysrv.de
cd /srv/senbon-guestbook
ADMIN=$(grep '^ADMIN_TOKEN=' .env | cut -d= -f2)

# See what is waiting
curl -s -H "Authorization: Bearer $ADMIN" \
  https://senbon.152.53.185.247.sslip.io/admin/entries | jq

# Publish one
curl -s -X POST -H "Authorization: Bearer $ADMIN" \
  https://senbon.152.53.185.247.sslip.io/admin/entries/<id>/approve

# Delete one
curl -s -X DELETE -H "Authorization: Bearer $ADMIN" \
  https://senbon.152.53.185.247.sslip.io/admin/entries/<id>
```

To publish signatures instantly instead, set `AUTO_APPROVE=true` in
`/srv/senbon-guestbook/.env` and run `docker compose up -d`.

---

## Anti-abuse

- **Honeypot** — a hidden `website` field. Filled means bot; the server action
  reports success and writes nothing, so the bot gets no signal.
- **Rate limit** — one signature per hashed IP per `RATE_LIMIT_SECONDS` (30).
- **Link block** — messages containing URLs are rejected with `422`.
- **Length caps** — name 40, message 280. Mirrored in `src/constants/guestbook.ts`.
- **Moderation** — the backstop for anything the above misses.

Visitor IPs are **never stored raw**. They arrive via the `x-visitor-ip` header
(the request itself comes from Vercel, not the visitor) and are HMAC-hashed
with `IP_HASH_SALT` before they touch the database.

---

## Deploying a change

```bash
scp -r api/ docker-compose.yml v2202507290292366800.luckysrv.de:/srv/senbon-guestbook/
ssh v2202507290292366800.luckysrv.de 'cd /srv/senbon-guestbook && docker compose up -d --build'
```

`.env` lives only on the server (`chmod 600`) and is never committed. It holds
`DB_PASSWORD`, `API_TOKEN`, `ADMIN_TOKEN`, `IP_HASH_SALT`, `AUTO_APPROVE`, and
`RATE_LIMIT_SECONDS`.

---

## Caddy

The stack added exactly one site block to `/srv/caddy/Caddyfile`, and joined
`caddy-proxy` to `senbon_net`. Nothing else on that host was modified.
Timestamped backups of the Caddyfile sit beside it as `Caddyfile.bak-*`.

Always validate before reloading — a bad config rejected at validate time
leaves the running config untouched:

```bash
docker exec caddy-proxy caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
docker exec caddy-proxy caddy reload   --config /etc/caddy/Caddyfile --adapter caddyfile
```
