# Senbon Garden — Zen Journal & Guestbook

A zen garden-inspired blog built with Next.js 16, Tailwind CSS, shadcn/ui, and Neon serverless PostgreSQL. Think floating lanterns, particle drift, and subtle easter eggs reminiscent of Genshin Impact promo sites.

## Features

- Markdown-powered journal stored in `content/journal/*.md`
- Guestbook with Neon PostgreSQL storage + token-protected admin moderation
- Animated hero with custom canvas particles, floating gradients, and Framer Motion card transitions
- Easter eggs: Konami unlock, logo tap secret, secret `/constellation/senbon-grove` page, time-based whispers
- Responsive layout, custom fonts (Playfair Display + Inter), and shadcn/ui components

## Tech Stack

- Next.js 16 (App Router, React 19)
- TypeScript
- Tailwind CSS v4 + shadcn/ui
- Framer Motion
- Neon PostgreSQL via `@neondatabase/serverless`
- React Markdown + remark/rehype plugins

## Local Development

```bash
npm install
npm run dev
# open http://localhost:3000
```

## Environment Variables

Copy `env.example` → `.env.local` and set:

```
DATABASE_URL=postgres://...
ADMIN_TOKEN=super-secret-token
NEXT_PUBLIC_SITE_URL=https://senbon.ch
```

Add the same variables to your Vercel project before deploying.

## Database Schema

```sql
CREATE TABLE IF NOT EXISTS guestbook_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at TIMESTAMP DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT
);
```