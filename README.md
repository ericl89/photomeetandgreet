# Photography & Model Networking

A modern web app for organizing model/photographer meetups. Attendees (members) authenticate with **email + password**, can **update their profiles** (including flexible **JSONB socials**), and **sign into events**. Admins manage groups, events, and exports with **group‑scoped RBAC**.

Built with **Next.js (App Router)**, **PostgreSQL**, and **Drizzle ORM**.

---

## Table of Contents

* [Features](#features)
* [Architecture](#architecture)
* [Directory Structure](#directory-structure)
* [Data Model](#data-model)
* [Security](#security)
* [API Overview](#api-overview)
* [Environment Variables](#environment-variables)
* [Getting Started](#getting-started)
* [Common Tasks](#common-tasks)
* [Deployment Notes](#deployment-notes)
* [Roadmap](#roadmap)
* [License](#license)

---

## Features

* **Groups**: filter events by group (seeded with *North Alabama* and *Central Alabama*), super admins can add more.
* **Members**: email/password login, profile edit (first/last, role: model/photographer, working name, **socials: JSONB**), view attendance history.
* **Events**: public list by group; event page with *Sign In* button (uses member session; no email typed on sign‑in).
* **Admin Panel**: SUPER_ADMIN and GROUP_ADMIN; group admins can manage events in assigned groups only.
* **Attendance & Export**: idempotent sign‑in per event; CSV export for admins.
* **Security**: HTTP‑only cookies, short‑lived access JWT + **rotating refresh** (separate stores for admin and member realms), CSRF, rate limits, lockout.

---

## Architecture

**Single repo, single deploy** with Next.js (App Router) for both UI and API (route handlers). No separate backend service needed.

```
Browser ─▶ Next.js (pages + route handlers)
            ├─ Auth middleware (cookies, CSRF, rate limit)
            ├─ API: /api/admin/*  (admins)
            │       /api/member/* (members)
            │       /api/events/* (public + member sign‑in)
            └─ Drizzle ▶ PostgreSQL
```

Key libs: React 18, TypeScript, Tailwind, Drizzle ORM, `jose` (JWT), `bcryptjs`/Argon2, Zod.

---

## Directory Structure

```
photomodel/
├─ app/
│  ├─ (public)/
│  │  ├─ page.tsx
│  │  ├─ events/
│  │  │  ├─ page.tsx
│  │  │  └─ [slug]/page.tsx
│  │  └─ sign-in/page.tsx
│  ├─ (member)/
│  │  ├─ layout.tsx
│  │  ├─ profile/page.tsx
│  │  └─ events/page.tsx
│  ├─ (admin)/
│  │  ├─ layout.tsx
│  │  ├─ page.tsx
│  │  ├─ groups/page.tsx
│  │  ├─ users/page.tsx
│  │  ├─ events/page.tsx
│  │  └─ events/new/page.tsx
│  ├─ api/
│  │  ├─ groups/route.ts
│  │  ├─ events/route.ts
│  │  ├─ events/slug/[slug]/route.ts
│  │  ├─ events/slug/[slug]/attend/route.ts
│  │  ├─ admin/
│  │  │  ├─ groups/route.ts
│  │  │  ├─ users/route.ts
│  │  │  ├─ events/route.ts
│  │  │  ├─ events/[id]/route.ts
│  │  │  └─ attendees/export/route.ts
│  │  ├─ member/
│  │  │  ├─ auth/login/route.ts
│  │  │  ├─ auth/register/route.ts
│  │  │  ├─ auth/refresh/route.ts
│  │  │  ├─ auth/logout/route.ts
│  │  │  ├─ auth/request-password-reset/route.ts
│  │  │  ├─ auth/reset-password/route.ts
│  │  │  └─ me/route.ts
│  │  ├─ auth/  # admin auth realm (optional if using SSO)
│  │  │  ├─ login/route.ts
│  │  │  ├─ refresh/route.ts
│  │  │  └─ logout/route.ts
│  │  └─ health/route.ts
│  └─ middleware.ts
├─ components/
│  ├─ ui/*
│  ├─ forms/
│  │  ├─ MemberProfileForm.tsx
│  │  └─ EventForm.tsx
│  ├─ admin/
│  │  ├─ GroupSelector.tsx
│  │  ├─ EventTable.tsx
│  │  └─ MemberNotes.tsx
│  └─ qr/QrDisplay.tsx
├─ db/
│  ├─ schema.ts
│  ├─ index.ts
│  ├─ migrations/
│  └─ seeds/001_groups.ts
├─ lib/
│  ├─ auth/
│  │  ├─ member.ts         # sign/verify member JWT, issue/rotate refresh
│  │  ├─ admin.ts          # sign/verify admin JWT, issue/rotate refresh
│  │  ├─ cookies.ts        # set/get/clear access/refresh/csrf
│  │  ├─ lockout.ts        # failed login counters & lock window
│  │  └─ crypto.ts         # randomToken(), hashToken(), ip hashing
│  ├─ authz/
│  │  ├─ requireMember.ts  # guard
│  │  └─ requireAdmin.ts   # guard + group-scope check
│  ├─ security/
│  │  ├─ csrf.ts
│  │  └─ rateLimit.ts
│  ├─ email/*              # (optional) transactional email utils
│  ├─ csv/exportAttendees.ts
│  ├─ time/tz.ts
│  └─ utils/{zod.ts, logger.ts}
├─ styles/globals.css
├─ public/favicon.ico
├─ scripts/{dev-seed.ts, backfill-attendances.ts}
├─ drizzle.config.ts
├─ next.config.js
├─ tsconfig.json
├─ package.json
├─ .env.example
└─ .env
```

---

## Data Model

**Core tables** (Drizzle + Postgres):

* `groups` — name, slug, timezone, archived flag.
* `users` (admins) — email, `passwordHash`, `role` (SUPER_ADMIN/GROUP_ADMIN).
* `user_groups` — admin ↔ group mapping.
* `members` — first/last, email (unique), `passwordHash`, role (model/photographer), `workingName`, **`socials jsonb`**, `emailVerifiedAt`, lockout fields.
* `admin_refresh_tokens` — rotating refresh for admin realm.
* `member_refresh_tokens` — rotating refresh for member realm.
* `events` — groupId, title, address, starts/ends, status, `signInSlug`, `qrSecret`, createdBy.
* `attendances` — `(eventId, memberId)` unique; signedInAt, source.
* `audit_log` — admin actions and sensitive operations.

> Socials are stored as **JSONB** (e.g., `{ "instagram": "@user", "tiktok": "https://..." }`).

---

## Security

* **Cookies**: `access_*` (JWT, 15m), `refresh_*` (opaque, 30d, rotating), `csrf` (double‑submit token).
* **CSRF**: require `x-csrf` header on non‑GET requests.
* **RBAC**: SUPER_ADMIN and GROUP_ADMIN; enforce scope for `/api/admin/*`.
* **Password policy**: min 8 chars (configurable); hash with **argon2id** or **bcrypt**.
* **Lockout**: track `failedLogins`; set `lockedUntil` after N failures.
* **Rate limits**: per IP and per identity on auth routes and sign‑in.
* **PII**: store IP/device **hashes** in refresh tables/audit if needed; define retention.

---

## API Overview

### Public

* `GET /api/groups` — list groups for dropdown
* `GET /api/events?groupId=ID` — list events by group (sorted by start time)
* `GET /api/events/slug/[slug]` — public event details

### Member Auth & Profile

* `POST /api/member/auth/register` — create account
* `POST /api/member/auth/login` — email + password → sets cookies
* `POST /api/member/auth/refresh` — rotate refresh → new access
* `POST /api/member/auth/logout` — revoke session
* `POST /api/member/auth/request-password-reset` — send reset email
* `POST /api/member/auth/reset-password` — set new password
* `GET /api/member/me` — current profile
* `PUT /api/member/me` — update profile (**socials jsonb** supported)

### Member Sign‑In

* `POST /api/events/slug/[slug]/attend` — record attendance for logged‑in member (idempotent per event)

### Admin

* `POST /api/admin/groups` — create group (**SUPER**)
* `POST /api/admin/users` — create admin (**SUPER**) with group assignments
* `POST /api/admin/events` — create event (SUPER/GROUP)
* `PUT /api/admin/events/[id]` — update event (scope enforced)
* `DELETE /api/admin/events/[id]` — delete event (scope enforced)
* `GET /api/admin/attendees/export?eventId=ID` — CSV export

---

## Environment Variables

Create `.env` from `.env.example` and set:

```
# Database
DATABASE_URL=postgres://user:pass@host:5432/photomodel

# JWT / Cookies
JWT_ADMIN_SECRET=change-me
JWT_MEMBER_SECRET=change-me
COOKIE_DOMAIN=.yourdomain.com
NODE_ENV=development

# Rate limits (example)
RATE_LIMIT_AUTH=10
RATE_LIMIT_WRITE=60
```

> In production set Secure cookies and strong secrets. Consider separate secrets per realm (admin vs member).

---

## Getting Started

```bash
# 1) Install deps
pnpm install

# 2) Configure .env
cp .env.example .env
# Edit DATABASE_URL and secrets

# 3) Generate and run migrations
pnpm drizzle:generate
pnpm drizzle:migrate

# 4) Seed baseline groups (North/Central Alabama)
pnpm tsx scripts/dev-seed.ts

# 5) Start dev
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Common Tasks

**Create SUPER_ADMIN** (one‑off script suggested):

```ts
// scripts/dev-seed.ts (example snippet)
// inserts groups + a SUPER admin with passwordHash
```

**Create event & show QR**

* Use Admin → Events → New. The API returns a `signInSlug`. The QR displays the public event URL.

**CSV export**

* Admin → Events → Export CSV (server builds via `lib/csv/exportAttendees.ts`).

---

## Deployment Notes

* Use a managed Postgres (Neon, RDS, Supabase, etc.).
* Run Drizzle migrations on deploy. Ensure `DATABASE_URL` points to prod.
* Set `NODE_ENV=production` and enable **Secure** cookies.
* Consider edge caching for public GETs; avoid caching authenticated routes.

---

## Roadmap

* Email verification for members (optional gate before attendance).
* Admin audit viewer UI.
* 2FA for admins (TOTP).
* Member self‑service deletion/export of data.

---

## License

MIT.
