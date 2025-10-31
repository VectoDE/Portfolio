# Contributing Guide

Thank you for your interest in improving the Portfolio platform! This document captures the recommended workflow, development standards, and expectations for contributions of any size.

## Table of Contents

- [Before You Start](#before-you-start)
- [Development Environment](#development-environment)
- [Workflow](#workflow)
- [Coding Standards](#coding-standards)
- [Database Changes](#database-changes)
- [Email & Notification Testing](#email--notification-testing)
- [Testing & Quality Gates](#testing--quality-gates)
- [Commit Messages](#commit-messages)
- [Pull Requests](#pull-requests)
- [Issue Reporting](#issue-reporting)
- [Community Expectations](#community-expectations)

## Before You Start

- Review the [README](./README.md) to understand the architecture, feature set, and environment requirements.
- Look for existing GitHub issues or discussions covering the work you intend to ship. Open an issue first for larger or breaking changes so the approach can be aligned upfront.
- For security-sensitive changes, coordinate privately using the channels described in [SECURITY.md](./SECURITY.md).

## Development Environment

1. Fork the repository and clone your fork locally.
2. Enable pnpm (if needed) and install dependencies:
   ```bash
   corepack enable pnpm
   pnpm install
   ```
3. Copy `.env.example` if provided or create `.env` using the environment variable matrix in the README. At minimum, set `DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL`.
4. Provision a MySQL database (local Docker container is fine) and apply migrations:
   ```bash
   pnpm prisma:generate
   pnpm prisma:migrate
   ```
5. Seed development data if helpful by starting the dev server and running `curl -X POST http://localhost:3000/api/seed`. This creates an admin user plus sample portfolio records.
6. Launch the development server with `pnpm dev` and confirm you can sign in via the seeded credentials or newly registered account.

> **Tip:** The project writes uploaded media to `public/uploads/` and log files to `logs/`. Add both folders to your `.gitignore` or clean them before committing.

## Workflow

1. Create a feature branch from `main` (`feature/improve-analytics`, `fix/contact-form-validation`, etc.).
2. Make incremental commits that keep the application buildable and the Prisma schema in sync with the database.
3. Rebase or merge `main` regularly to avoid long-lived drift.
4. When ready, open a pull request against `main` and request review from a maintainer.

## Coding Standards

- Write idiomatic, strongly-typed TypeScript. Avoid `any` unless absolutely necessary and justified in a code comment.
- Prefer React Server Components and Server Actions where they fit the App Router model; use client components only when interactivity is required.
- Reuse existing UI primitives in `components/ui/*` and `components/dashboard/*`. Add new primitives deliberately so the design system stays cohesive.
- Validate inputs with Zod (see existing API handlers) and handle error states gracefully on the client.
- Keep server-only logic in API routes, server components, or `lib/`. Do not leak secrets to client bundles.
- Update documentation (README, API docs, environment tables) whenever you introduce new environment variables, commands, or workflows.

## Database Changes

- Edit `prisma/schema.prisma` and create a migration with `pnpm prisma:migrate dev --name descriptive-migration`.
- Inspect generated SQL for correctness and data safety before committing.
- Regenerate the Prisma client (`pnpm prisma:generate`) after schema changes.
- Include sample data updates or seeding scripts when your change relies on new reference data.
- Describe the impact of the migration in your pull request, including any manual steps operators must perform.

## Email & Notification Testing

- By default, development email uses Ethereal credentials. Check the console for preview URLs when exercising `lib/email.ts` or newsletter flows.
- When working on SMTP integration, use the dashboard settings UI (`/dashboard/settings`) to supply credentials instead of hard-coding secrets.
- Avoid committing real SMTP credentials or inbox transcripts. Use `.env` and secrets managers.

## Testing & Quality Gates

Run the following commands before pushing:

```bash
pnpm lint
pnpm typecheck
pnpm format:check
pnpm validate      # optional shortcut for lint + typecheck
```

- Use `pnpm lint:fix` and `pnpm format` to resolve style issues automatically.
- For behavioural changes, add or update unit/component tests when feasible. If automated coverage is impractical, describe manual verification steps in the PR.

## Commit Messages

- Use the imperative mood (`Add dashboard analytics cards`, `Fix contact status transitions`).
- Keep subject lines under ~72 characters when possible.
- Provide additional context in the body for complex changes, migrations, or breaking adjustments.

## Pull Requests

- Fill out the PR template (if present) with a concise summary, screenshots for UI changes, and explicit testing evidence.
- Reference related issues using GitHub keywords (`Fixes #123`).
- Call out new environment variables, migrations, or operational runbooks so deployers can react.
- Ensure CI checks pass before requesting a review. Address feedback promptly and keep conversations focused on the change set.

## Issue Reporting

- Search existing issues to avoid duplicates.
- Include reproducible steps, expected vs. actual behaviour, browser/OS, and Node.js version information.
- For security vulnerabilities, use the private disclosure channels defined in [SECURITY.md](./SECURITY.md) instead of public issues.

## Community Expectations

- Be respectful and inclusive. Constructive feedback and knowledge sharing are valued.
- Assume positive intent when reviewing or responding to comments.
- Credit previous contributors when building on their work.

We appreciate your time and effort in making the Portfolio platform better for everyone!
