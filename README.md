# Portfolio Platform

A production-ready personal portfolio and creator operations platform built with **Next.js 16**, **TypeScript**, and **Prisma**. The application delivers a polished public marketing site backed by an authenticated dashboard that manages projects, skills, certificates, career entries, newsletters, analytics, and inbound contact workflows. Email automation, granular subscription preferences, and engagement features (comments, reactions, and community highlights) are implemented end to end.

## Table of Contents

- [Overview](#overview)
  - [Public experience](#public-experience)
  - [Creator dashboard](#creator-dashboard)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Optional: Seed Sample Content](#optional-seed-sample-content)
  - [User Registration](#user-registration)
  - [First-Time Setup (Admin Account)](#first-time-setup-admin-account)
  - [Running the App](#running-the-app)
- [Quality Assurance](#quality-assurance)
- [Project Structure](#project-structure)
- [Feature Highlights](#feature-highlights)
- [API & Integrations](#api--integrations)
- [Email & Newsletter Workflows](#email--newsletter-workflows)
- [Analytics & Logging](#analytics--logging)
- [Deployment Notes](#deployment-notes)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

## Overview

The platform combines a story-driven marketing site with operational tooling for keeping portfolio content fresh.

### Public experience

- **Homepage hero (`app/page.tsx`)** – Animated hero visualization, impact metrics sourced from engagement data, and clear call-to-actions.
- **About, projects, and skill highlights (`app/about`, `app/projects`, `components/featured-projects.tsx`, `components/skills-showcase.tsx`)** – Curated content sourced from the same data as the dashboard.
- **Contact funnel (`app/contact`)** – Validated form posts to `POST /api/contacts`, triggers administrative notifications, and optionally sends auto replies.
- **Newsletter preference centre (`app/newsletter`, `app/unsubscribe`)** – Allows visitors to subscribe, confirm, or adjust granular preferences without exposing the dashboard.
- **Legal and privacy pages (`app/privacy`, `app/impressum`)** – Built-in placeholders for GDPR compliance.

### Creator dashboard

- **Project management (`app/dashboard/projects`)** – Create, edit, and feature projects, attach technology stacks, feature breakdowns, and upload media via the authenticated upload endpoint.
- **Skills, certificates, and career history (`app/dashboard/skills`, `certificates`, `career`)** – Structured CRUD workflows mirroring the Prisma schema.
- **Contacts inbox (`app/dashboard/contacts`)** – Filter inbound messages by status, add notes, and keep a full history of correspondence.
- **Newsletter operations (`app/dashboard/newsletter`)** – Manage subscribers, craft campaign drafts, schedule sends, and respect per-category preferences defined in `SubscriberPreference`.
- **Analytics overview (`app/dashboard/analytics`)** – Visualises page views, unique visitors, and contact trends captured via `app/api/analytics/*`.
- **Settings (`app/dashboard/settings`)** – Configure SMTP, auto-replies, sender identity, and test delivery through `app/api/settings/email`.

## Key Features

- **Authentication & user management** – Credentials-based sign-in powered by NextAuth (`app/api/auth/[...nextauth]/route.ts`) with username management, profile editing, and secure password updates under `app/api/user/*`.
- **Portfolio content system** – Prisma models in `prisma/schema.prisma` back projects, features, skills, certificates, and career entries. Dashboard forms enforce validation and reuse shared UI primitives.
- **Engagement tooling** – Visitors can leave comments and reactions on projects (`app/api/projects/[id]/comments|reactions`), while the homepage aggregates community highlights via `lib/engagement.ts`.
- **Contact workflows** – Contact form submissions are persisted (`Contact` model), automatically notify administrators via `lib/email.ts`, and support status tracking (`unread`, `read`, `replied`, `archived`).
- **Newsletter engine** – Subscription management, preference toggles, and campaign delivery are handled by `lib/newsletter.ts` and `app/api/newsletter/*`, with unsubscribe tokens and dynamic content linking.
- **Media management** – Authenticated users can upload images through `app/api/upload/route.ts`, which validates MIME types, stores files in `public/uploads`, and records metadata in the `Media` table.
- **Analytics & privacy** – Lightweight client tracking (`lib/track-pageview.ts`) respects user consent, hashes IP addresses with `IP_HASH_SALT`, and exposes dashboards through `app/api/analytics`.
- **Operational logging** – Client-side logs can be forwarded to `app/api/logger/route.ts`, writing to Winston transports configured in `lib/logger.ts`.

## Technology Stack

| Layer | Technologies |
| --- | --- |
| Framework | Next.js 16 (App Router), React 18 |
| Language | TypeScript, modern ECMAScript |
| Styling | Tailwind CSS, tailwind-merge, tailwindcss-animate |
| UI & motion | Radix UI primitives, Framer Motion, React Resizable Panels, Sonner toasts |
| 3D & visuals | React Three Fiber, @react-three/drei for interactive hero scenes |
| Forms & state | React Hook Form, Zod validation, Zustand stores |
| Authentication | NextAuth (credentials provider) with JWT sessions |
| Data & persistence | Prisma ORM targeting MySQL, SWR for client-side revalidation |
| Email & notifications | Nodemailer with SMTP credentials persisted via Prisma, Ethereal fallback for development |
| Telemetry & logging | Custom analytics endpoints, Winston logger, hashed visitor identifiers |
| Tooling | pnpm, TypeScript strict mode, ESLint 9, Prettier 3 |

## System Architecture

- **App Router** structure under `app/` combines public routes, authenticated dashboard segments, nested layouts, and API route handlers.
- **Prisma ORM** defines schema and migrations in `prisma/`, generating a single shared client via `lib/db.ts` with development-friendly stubbing when the client is missing.
- **Domain libraries** encapsulate core logic: `lib/auth.ts` (NextAuth configuration), `lib/email.ts` (transport + templates), `lib/newsletter.ts` (campaign orchestration), `lib/engagement.ts` (comments/reactions aggregation), and `lib/track-pageview.ts` (analytics ingestion helper).
- **Type-safe contracts** live in `types/`, keeping API responses consistent across server actions and client hooks.
- **Dashboard UI** reuses composable components in `components/dashboard/*`, `components/ui/*`, and custom hooks from `hooks/` (e.g., SWR data fetchers for CRUD resources).

## Getting Started

### Prerequisites

- **Node.js** ≥ 20.9.0
- **pnpm** ≥ 9.0.0 (enable with `corepack enable pnpm` if not installed)
- **MySQL** 8.x (local instance, Docker container, or managed service such as PlanetScale)

### Installation

```bash
# Clone the repository
git clone https://github.com/VectoDE/Portfolio.git
cd Portfolio

# Enable pnpm (if required) and install dependencies
corepack enable pnpm
pnpm install
```

### Environment Variables

Create a `.env` (or `.env.local`) at the project root. The following variables are consumed throughout the application:

| Variable | Description | Example |
| --- | --- | --- |
| `DATABASE_URL` | MySQL connection string consumed by Prisma. Overrides the development default in `prisma/schema.prisma`. | `mysql://user:password@localhost:3306/portfolio` |
| `NEXTAUTH_URL` | Absolute URL used by NextAuth for callbacks. | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Secret used to sign NextAuth JWTs. Generate with `openssl rand -hex 32`. | `f4d1...` |
| `NEXT_PUBLIC_APP_URL` | Public base URL surfaced in emails and share links. | `http://localhost:3000` |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | Enable (`true`) or disable (`false`) client-side page view tracking. | `true` |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Optional verification token injected into `<meta name="google-site-verification">`. | `abc123` |
| `NEXT_PUBLIC_BING_SITE_VERIFICATION` | Optional Bing site verification token exposed as `msvalidate.01`. | `xyz789` |
| `EMAIL_SERVER`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD` | Default SMTP credentials used when no custom settings exist in the dashboard. | `smtp.sendgrid.net`, `587`, `apikey`, `SG...` |
| `EMAIL_FROM` | Default `From` header if none is stored in `EmailSettings`. | `Portfolio <noreply@example.com>` |
| `ADMIN_EMAIL` | Default administrative contact for inbound contact alerts. | `admin@example.com` |
| `SEND_AUTO_REPLY` | Set to `true` to send automatic acknowledgements for contact submissions. | `false` |
| `ETHEREAL_EMAIL`, `ETHEREAL_PASSWORD` | Optional Ethereal credentials for development previews (fallback transport). | `user@ethereal.email`, `pass` |
| `LOG_TO_FILE` | Server logs go to `logs/*.log` unless the app runs on Vercel, Netlify or AWS Lambda, where only the console is used. `false` turns file logs off, `true` forces them on. | *(empty)* |
| `IP_HASH_SALT` | Secret salt combined with visitor IPs before hashing analytics records. | `super-secret-salt` |
| `ALLOW_REGISTRATION` | Self-service sign-up once at least one account exists. Off unless set to `true`; while it is off, every attempt receives `403`. Accounts created this way get the `Member` role. | `false` |
| `ADMIN_BOOTSTRAP_EMAIL` | Email address of the first admin. On an empty database only this address can register (compared after trimming, case-insensitive), together with `ADMIN_BOOTSTRAP_TOKEN`, and the account becomes the admin. Unset or empty keeps the first registration closed (`403`). | `you@example.com` |
| `ADMIN_BOOTSTRAP_TOKEN` | Secret for the first registration, at least 32 characters. It must be entered in the *Setup token* field on `/register` together with `ADMIN_BOOTSTRAP_EMAIL`. Compared in constant time. Unset, empty or shorter than 32 characters keeps the first registration closed (`403`). Has no effect once an account exists; remove it after the setup. | `openssl rand -hex 32` |

> **Tip:** Whenever you introduce a new environment variable, document it in this table and surface an onboarding default inside the relevant API route.

### Database Setup

1. Adjust `DATABASE_URL` in `.env` (or update the datasource inside `prisma/schema.prisma`) to point at your MySQL instance.
2. Generate the Prisma client and apply migrations:

   ```bash
   pnpm prisma:generate
   pnpm prisma:migrate
   ```

3. (Optional) Inspect data via Prisma Studio:

   ```bash
   pnpm prisma:studio
   ```

### Optional: Seed Sample Content

There is no HTTP seed endpoint; `/api/seed` was removed because it is needless attack surface. Sample content is loaded with the Prisma seed script (`prisma/seed.mjs`) from the command line, never through the running app.

### User Registration

Self-service registration is disabled by default. After the first admin exists, `/api/register` answers `403` unless `ALLOW_REGISTRATION=true` is set; accounts created that way get the `Member` role and never become admins.

### First-Time Setup (Admin Account)

A fresh installation has no accounts. To stop strangers from claiming a newly deployed, publicly reachable instance, the first account needs a pre-configured address and a secret token:

1. Set `ADMIN_BOOTSTRAP_EMAIL` to your own email address and `ADMIN_BOOTSTRAP_TOKEN` to a random secret of at least 32 characters (for example `openssl rand -hex 32`) in the environment of the running app (for example `.env` or your hosting provider's settings), then restart or redeploy.
2. Open `/register`, sign up with exactly that address and paste the token into the *Setup token* field. Case and surrounding spaces of the address do not matter; the token must match exactly (surrounding spaces are ignored). The account receives the admin role.
3. Remove `ADMIN_BOOTSTRAP_TOKEN` (and optionally `ADMIN_BOOTSTRAP_EMAIL`) afterwards. Both only matter while the database has no accounts; once an account exists they have no effect.

> **Upgrading an instance that has no account yet:** since `ADMIN_BOOTSTRAP_TOKEN` was introduced, an empty instance stays closed until the token is set as well. Setting only `ADMIN_BOOTSTRAP_EMAIL` is no longer enough. Instances that already have an account are not affected.

If `ADMIN_BOOTSTRAP_EMAIL` or `ADMIN_BOOTSTRAP_TOKEN` is missing, empty or the token is shorter than 32 characters, or a different address or token is used, the first registration is refused with `403` and the same message as a closed registration. While the database is empty this also applies to malformed JSON and missing fields; the usual `400` checks (for example a password shorter than 8 characters) only run once address and token match. The server log records why (`Initial registration refused: ...`) without logging the submitted address. The check is repeated inside the database transaction, so two parallel first registrations cannot both succeed.

Request bodies for `/api/register` are limited to 16 KB. The body is always read (up to that limit) before the route decides anything, so an empty instance and a closed one respond the same way, also in timing. A larger body is refused with the same `403` while the database is empty or registration is closed, and with `413` (`Request body is too large.`) only when registration is open. If a parallel sign-up with the same address hits the unique constraint, open registration answers `409` (`Registration could not be completed.`); during the first registration it stays the generic `403`.

#### Right after the first deploy

Do the first-time setup immediately after deploying, before you share the URL:

1. Register with the `ADMIN_BOOTSTRAP_EMAIL` address and the `ADMIN_BOOTSTRAP_TOKEN` as described above.
2. Sign in with the new account and check that the admin dashboard opens. Only then is the setup complete.
3. Remove `ADMIN_BOOTSTRAP_TOKEN` from the environment. Keep the token secret until then: it is what stops someone who knows the (often public) address from claiming the instance first.

### Running the App

- **Development** – `pnpm dev` (serves the app at `http://localhost:3000`).
- **Production build** –
  ```bash
  pnpm build
  pnpm start   # serves the compiled build on port 3020
  ```
- **Default port start** – `pnpm prod:start` runs the compiled build on the framework’s default port (useful for hosting providers).

Ensure `.env` variables are available during both build and runtime. Configure SMTP connectivity before sending newsletters from production.

## Quality Assurance

Run these scripts locally before pushing changes:

- `pnpm lint` – ESLint with Next.js rules.
- `pnpm lint:fix` – Auto-fix lint violations where possible.
- `pnpm typecheck` – TypeScript in `--noEmit` mode.
- `pnpm test` – Unit tests in `tests/` with the built-in Node.js test runner (Node.js 22 or newer).
- `pnpm format:check` / `pnpm format` – Enforce Prettier style guidelines.
- `pnpm validate` – Convenience script chaining linting and type checks.

## Project Structure

```
app/                     # App Router pages, layouts, and API routes
  about/                 # Public about page content
  account/               # Authenticated profile & settings pages
  contact/               # Public contact form flow
  dashboard/             # Creator dashboard (analytics, CRUD, newsletters, settings)
  newsletter/            # Subscriber management & preference centre
  unsubscribe/           # Opt-out and token validation flows
  api/                   # REST-like endpoints backing dashboard actions and public forms
components/              # Reusable UI primitives and feature components
  dashboard/             # Dashboard-specific tables, forms, charts, and modals
  ui/                    # Design system components built on Radix + Tailwind
hooks/                   # Client-side SWR data hooks for CRUD resources
lib/                     # Authentication, database, email, analytics, logging helpers
prisma/                  # Prisma schema and migrations
public/uploads/          # Runtime media uploads stored by the upload API
styles/                  # Tailwind and global CSS configuration
types/                   # Shared TypeScript types and API response contracts
```

## Feature Highlights

- **Dashboard charts & metrics** – Analytics widgets pull from `app/api/analytics/route.ts` and `app/api/analytics/pageview/route.ts`, summarising page views, unique visitors, and contact trends.
- **Content moderation** – Project feedback surfaces in `components/project-feedback.tsx`, with mutation endpoints handling optimistic updates and SWR cache invalidation.
- **Email settings management** – Administrators can persist SMTP credentials and toggle auto-replies via `app/dashboard/settings/email-form.tsx`, backed by Prisma records in `EmailSettings`.
- **Community highlights** – `lib/engagement.ts` aggregates top projects, comment counts, and reactions, powering homepage storytelling.

## API & Integrations

Key route handlers live under `app/api/*`:

- `auth/[...nextauth]` – NextAuth credentials provider & JWT session management.
- `register` & `login` flows – User onboarding and sign-in endpoints.
- `user/profile`, `user/password` – Profile updates, username validation, and password resets.
- `projects`, `skills`, `certificates`, `career` – CRUD endpoints with Zod validation and SWR-compatible responses.
- `projects/[id]/comments` & `projects/[id]/reactions` – Feedback capture with authentication checks and reaction toggling.
- `contacts` – Public form ingestion plus authenticated pagination and status filters.
- `newsletter/*` – Subscriber CRUD, campaign scheduling, send triggers, and unsubscribe helpers.
- `analytics/*` – Page view tracking, aggregated metrics, and contact funnel reporting.
- `settings/email` – Persisted SMTP configuration and test-delivery utilities.
- `upload` – Authenticated media uploads with MIME/size guards and filesystem persistence.
- `logger` – Client log forwarding to the Winston-based server logger.

Management endpoints require an authenticated account with the admin role (`lib/authz.ts`); endpoints for a signed-in user only touch that user's own data. All endpoints validate inputs with Zod or manual guards and surface descriptive error messages.

## Email & Newsletter Workflows

- SMTP credentials are securely stored in the `EmailSettings` table and can be updated from the dashboard. If unset, defaults from environment variables (or Ethereal in development) are used.
- Campaigns created in `app/dashboard/newsletter` leverage helpers in `lib/newsletter.ts` to build personalised unsubscribe links (`/unsubscribe?token=…`) and respect category preferences.
- Contact form submissions trigger `sendContactNotification` and, when enabled, `sendContactAutoReply`, keeping stakeholders informed without manual intervention.

## Analytics & Logging

- `lib/track-pageview.ts` sends anonymised page view events to `POST /api/analytics/pageview`, hashing IP addresses with `IP_HASH_SALT` to protect visitor privacy.
- Aggregated metrics (totals, unique visitors, time windows) are exposed via `GET /api/analytics/pageview` and rendered in dashboard charts.
- The Winston logger in `lib/logger.ts` writes to files under `logs/` (not rotated; rotate them with the host, e.g. logrotate) and to the console during development. On Vercel, Netlify and AWS Lambda it only writes to the console (see `LOG_TO_FILE`). Client-originated logs can be forwarded to the `logger` API for investigation.

## Deployment Notes

- Set production values for `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, SMTP credentials, and `IP_HASH_SALT` before deploying.
- Ensure the hosting platform exposes `DATABASE_URL` during both build and runtime so Prisma migrations and the client can connect.
- Persist the `logs/` directory (or redirect logs to your hosting provider’s logging solution) if you rely on on-disk Winston transports.
- Back up the `public/uploads/` directory or replace the upload implementation with object storage when deploying to stateless environments.
- Use `pnpm build` + `pnpm start` (or `pnpm prod:start`) to serve the optimised production bundle. Configure process managers or hosting adapters accordingly.

## Security

Review the dedicated [SECURITY.md](./SECURITY.md) for supported versions, disclosure policy, hardening tips, and compliance posture. Highlights include hashed analytics identifiers, role-based dashboard access, and guarded upload endpoints.

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) for branching strategy, coding standards, database migration expectations, and review etiquette.

## License

Distributed under the [MIT License](./LICENSE).
