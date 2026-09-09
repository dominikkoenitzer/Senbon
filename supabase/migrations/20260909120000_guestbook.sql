-- Guestbook schema. Idempotent on purpose: it is applied once through the SQL
-- editor when the project is first set up and again by `supabase db push`
-- once the CLI is linked, and the second run must be a no-op.

create table if not exists public.guestbook_entries (
  id          bigint generated always as identity primary key,
  name        text not null check (char_length(name) between 1 and 40),
  message     text not null check (char_length(message) between 1 and 280),
  status      text not null default 'pending'
              check (status in ('pending', 'approved', 'rejected')),
  -- HMAC of the visitor address. The raw address never reaches this table.
  ip_hash     text,
  created_at  timestamptz not null default now()
);

create index if not exists guestbook_entries_status_created_idx
  on public.guestbook_entries (status, created_at desc);

create index if not exists guestbook_entries_ip_hash_created_idx
  on public.guestbook_entries (ip_hash, created_at desc);

create table if not exists public.guestbook_settings (
  key         text primary key,
  value       text not null,
  updated_at  timestamptz not null default now()
);

-- Nothing in the browser ever talks to these tables. RLS is on and there are
-- no policies, so the publishable key can neither read nor write. The site
-- uses the secret key from a server action, which bypasses RLS.
alter table public.guestbook_entries enable row level security;
alter table public.guestbook_settings enable row level security;

revoke all on table public.guestbook_entries from anon, authenticated;
revoke all on table public.guestbook_settings from anon, authenticated;

grant all on table public.guestbook_entries to service_role;
grant all on table public.guestbook_settings to service_role;
grant usage, select on all sequences in schema public to service_role;

-- Seed only. After this the row is the source of truth and is toggled from
-- /guestbook/admin.
insert into public.guestbook_settings (key, value)
values ('auto_approve', 'true')
on conflict (key) do nothing;
