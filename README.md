# Portfolio Platform

A full-stack personal portfolio and content management platform built with **Next.js 15**, **TypeScript**, and **Prisma**. The application combines a public marketing site with an authenticated creator dashboard for managing projects, skills, career entries, certificates, newsletters, and inbound contacts. Email workflows, analytics, and granular content preferences are supported out of the box.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Running the App](#running-the-app)
- [Quality Assurance](#quality-assurance)
- [Project Structure](#project-structure)
- [API & Integrations](#api--integrations)
- [Email & Newsletter Workflows](#email--newsletter-workflows)
- [Analytics & Logging](#analytics--logging)
- [Deployment Notes](#deployment-notes)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

## Overview

The portfolio platform serves as both a public-facing site and a creator control panel:

- Visitors can explore projects, read the about page, send contact messages, and manage newsletter subscriptions.
- Authenticated administrators can curate portfolio content, respond to messages, configure email delivery, and trigger newsletter campaigns from a responsive dashboard experience.

The codebase embraces modern Next.js conventions (App Router, Server Actions, React Server Components) while retaining client-driven interactivity where required for the dashboard UI.

## Key Features

- **Authentication & Access Control**: Credentials-based sign-in powered by NextAuth with JWT sessions and middleware-protected dashboard routes.
- **Portfolio Management**: CRUD flows for projects, skills, career milestones, and certificates with image support, feature tagging, and optional newsletter promotion.
- **Contacts Inbox**: Capture messages from the public contact form, categorize them by status, add private notes, and trigger automated replies.
- **Newsletter Engine**: Manage subscribers, granular subscription preferences, and send project or announcement campaigns using templated transactional emails.
- **Analytics & Insights**: Track page views and aggregate visitor metrics for dashboard reporting.
- **Themeable UI**: Tailwind CSS, Radix UI primitives, and Zustand state management deliver a polished, accessible design system with dark mode support.
- **Developer Tooling**: Strict TypeScript, ESLint, Prettier, and Prisma integration provide a reliable foundation for iterative enhancements.

## Technology Stack

| Layer                 | Technologies                                             |
| --------------------- | -------------------------------------------------------- |
| Framework             | Next.js 15 (App Router), React 18                        |
| Language              | TypeScript                                               |
| Styling               | Tailwind CSS, tailwind-merge, tailwindcss-animate        |
| UI Components         | Radix UI, Lucide Icons, Embla Carousel                   |
| State & Forms         | Zustand, React Hook Form, Zod                            |
| Authentication        | NextAuth (Credentials provider)                          |
| Email & Notifications | Nodemailer, custom newsletter templates, Sonner toasts   |
| Data & Persistence    | Prisma ORM targeting MySQL, SWR for client data fetching |
| Tooling               | pnpm, ESLint, Prettier, TypeScript, Winston logger       |

## System Architecture

- **App Router** organizes both public pages (`app/page.tsx`, `app/about`, `app/projects`, etc.) and authenticated dashboard routes (`app/dashboard/...`).
- **API Routes** in `app/api/*` handle authentication, CRUD operations, analytics logging, newsletter delivery, contact workflows, and configuration endpoints.
- **Prisma ORM** provides database access with strongly-typed models defined in `prisma/schema.prisma`.
- **Email services** leverage Nodemailer to send transactional and marketing emails with configurable SMTP providers or Ethereal test credentials.
- **Client State** uses React Query-like patterns via SWR and lightweight Zustand stores for UI state coordination inside dashboard components.

## Getting Started

### Prerequisites

- Node.js **>= 18.18.0**
- pnpm **>= 9.0.0** (or use `corepack enable` to activate the bundled pnpm)
- A MySQL-compatible database (local Docker, managed service, or PlanetScale)

### Installation

```bash
-npm install
-npx prisma generate
-npx prisma db push
-npm run build
-npm run start
+# Clone the repository
+git clone https://github.com/VectoDE/Portfolio.git
+cd Portfolio
+
+# Install dependencies
+pnpm install
```

### Environment Variables

Create a `.env` file at the project root (you can start from `.env.local` in development). The most important variables are outlined below:

| Variable                                                        | Description                                                                           | Example                                          |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `DATABASE_URL`                                                  | MySQL connection string used by Prisma. Overrides the default URL in `schema.prisma`. | `mysql://user:password@localhost:3306/portfolio` |
| `NEXTAUTH_URL`                                                  | Public base URL used by NextAuth during callbacks.                                    | `http://localhost:3000`                          |
| `NEXTAUTH_SECRET`                                               | Secret key for signing NextAuth JWTs. Generate via `openssl rand -hex 32`.            | `f4d1...`                                        |
| `NEXT_PUBLIC_APP_URL`                                           | Browser-accessible base URL for links embedded in emails.                             | `http://localhost:3000`                          |
| `EMAIL_SERVER` / `EMAIL_PORT` / `EMAIL_USER` / `EMAIL_PASSWORD` | SMTP credentials for transactional email delivery.                                    | `smtp.ethereal.email`, `587`, `user`, `pass`     |
| `EMAIL_FROM`                                                    | Default `from` header for outbound messages.                                          | `Portfolio <noreply@example.com>`                |
| `ADMIN_EMAIL`                                                   | Administrative notification address for contact form alerts.                          | `admin@example.com`                              |
| `SEND_AUTO_REPLY`                                               | Enables automatic acknowledgement emails for contact submissions (`true` / `false`).  | `true`                                           |
| `ETHEREAL_EMAIL` / `ETHEREAL_PASSWORD`                          | Optional Ethereal testing credentials for development previews.                       | `user@ethereal.email`                            |
| `NEXT_PUBLIC_ENABLE_ANALYTICS`                                  | Toggles client-side page view tracking.                                               | `true`                                           |

> **Tip:** Prisma reads `DATABASE_URL` at runtime; ensure it is set before running any Prisma commands.

### Database Setup

```bash
# Generate the Prisma client after updating the schema
pnpm prisma:generate

# Apply schema changes to your development database
pnpm prisma:migrate

# (Optional) Inspect data and edit records in a browser
pnpm prisma:studio
```

### Running the App

- **Development:** `pnpm dev` (served at `http://localhost:3000`).
- **Production build:**
  ```bash
  pnpm build
  pnpm start # listens on port 3020 by default
  ```
- **Deploy-ready start:** Use `pnpm prod:start` to run the compiled build on the framework's default port.

Ensure the `.env` file (or environment variables in your hosting provider) is available in both build and runtime environments.

## Quality Assurance

- `pnpm lint` – run ESLint against the project.
- `pnpm typecheck` – execute TypeScript in `--noEmit` mode to validate types.
- `pnpm format:check` / `pnpm format` – enforce Prettier formatting standards.
- `pnpm validate` – convenience script that chains linting and type checking.

Running these scripts before committing helps keep the codebase consistent and prevents CI failures.

## Project Structure

```
app/                 # App Router pages, layouts, and API routes
components/          # Reusable UI components and design system primitives
hooks/               # Custom React hooks shared across the app
lib/                 # Utility libraries (auth, database client, logging, emails, analytics)
prisma/              # Prisma schema and migrations
public/              # Static assets (images, fonts, icons)
styles/              # Global CSS and Tailwind configurations
types/               # Shared TypeScript type definitions
```

## API & Integrations

- `app/api/auth/*` – NextAuth handlers for credentials-based login and session management.
- `app/api/projects`, `app/api/skills`, `app/api/certificates`, `app/api/career` – CRUD endpoints for dashboard resources.
- `app/api/contacts` – Submit and manage inbound contact messages; supports automated replies.
- `app/api/newsletter/*` – Subscriber management, campaign scheduling, and delivery.
- `app/api/analytics` & `app/api/logger` – Capture page views and persist structured logs.
- `app/api/upload` – Handle media uploads from the dashboard.

Each route enforces authentication and input validation where appropriate using Zod schemas and middleware guards.

## Email & Newsletter Workflows

- SMTP credentials are configurable from the dashboard settings and persisted in the `EmailSettings` model.
- Newsletters support personalized unsubscribe links and category-based preferences (projects, certificates, skills, careers).
- Development mode supports Ethereal email previews with logged message URLs.

## Analytics & Logging

- Client-side tracking uses a lightweight page view reporter controlled via `NEXT_PUBLIC_ENABLE_ANALYTICS`.
- Server-side analytics aggregates visits (`Analytics`, `PageView` models) for charting in the dashboard.
- Structured logging is handled by a Winston logger with environment-aware transports.

## Deployment Notes

- Provide production-ready values for `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, SMTP credentials, and `NEXT_PUBLIC_APP_URL` before deploying.
- Ensure your hosting platform exposes the `DATABASE_URL` to Prisma during both build and runtime phases.
- If using a managed MySQL provider, update `prisma/schema.prisma` or set `DATABASE_URL` accordingly before running migrations in CI/CD pipelines.
- Use `pnpm build` followed by `pnpm start` (or your platform's adapter) to serve the optimized production bundle.

## Security

Please review [SECURITY.md](./SECURITY.md) for vulnerability disclosure guidelines and supported release information.

## Contributing

We welcome improvements and bug fixes! See [CONTRIBUTING.md](./CONTRIBUTING.md) for development workflows, coding standards, and pull request expectations.

## License

Distributed under the [MIT License](./LICENSE).
