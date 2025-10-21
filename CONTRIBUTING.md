# Contributing Guide

Thank you for your interest in improving the Portfolio platform! This document outlines the recommended workflow, development standards, and expectations for contributions of any size.

## Table of Contents

- [Before You Start](#before-you-start)
- [Development Environment](#development-environment)
- [Workflow](#workflow)
- [Coding Standards](#coding-standards)
- [Database Changes](#database-changes)
- [Commit Messages](#commit-messages)
- [Pull Requests](#pull-requests)
- [Issue Reporting](#issue-reporting)
- [Community Expectations](#community-expectations)

## Before You Start

- Review the [README](./README.md) to understand the project's architecture and feature set.
- Ensure there is an existing GitHub issue describing the change or create one before starting significant work.
- For large or breaking changes, open a discussion issue or draft PR first to align on direction.

## Development Environment

1. Fork the repository and clone your fork locally.
2. Enable pnpm (if necessary) and install dependencies:
   ```bash
   corepack enable
   pnpm install
   ```
3. Create a `.env` file based on the environment variable guidance in the README and provide values for authentication, database, and email settings.
4. Set up a local MySQL instance and apply Prisma migrations:
   ```bash
   pnpm prisma:generate
   pnpm prisma:migrate
   ```
5. Run the development server with `pnpm dev` and ensure you can sign in via NextAuth.

## Workflow

1. Create a feature branch from `main` using a descriptive name (e.g., `feature/newsletter-segmentation` or `fix/contact-form-validation`).
2. Make focused commits that keep the codebase buildable at each step.
3. Keep your branch up to date with `main` by rebasing or merging frequently.
4. When ready, open a pull request against `main` and request review.

## Coding Standards

- Follow TypeScript best practices and avoid using `any` unless absolutely necessary.
- Prefer functional components, hooks, and Next.js App Router conventions.
- Reuse existing design system components where possible to maintain consistency.
- Validate user input with Zod schemas or server-side guards before persisting to the database.
- Keep server-only code in the appropriate files (`app/api/*`, server components, or `lib/`) and avoid leaking secrets to the client bundle.
- Run the following scripts before pushing:
  ```bash
  pnpm lint
  pnpm typecheck
  pnpm format:check
  ```

## Database Changes

- Modify `prisma/schema.prisma` and run `pnpm prisma:migrate dev --name descriptive-migration` to generate a new migration.
- Review generated SQL for accuracy and safety before committing.
- Include updated Prisma client artifacts by running `pnpm prisma:generate`.
- Document schema changes in your pull request summary.

## Commit Messages

- Use the imperative mood (e.g., `Add dashboard analytics cards`).
- Keep subject lines under 72 characters when possible.
- Provide additional context in the body for complex changes or breaking updates.

## Pull Requests

- Fill in the PR template if available, including a clear summary, testing evidence, and screenshots for UI changes.
- Reference related issues using GitHub keywords (`Fixes #123`).
- Include notes about migrations, environment variable additions, or configuration updates.
- Ensure CI checks pass before requesting a review.
- Be responsive to review feedback and keep the discussion focused on the change at hand.

## Issue Reporting

- Search existing issues before creating a new one to avoid duplicates.
- Provide reproducible steps, expected vs. actual behavior, and environment details (browser, OS, Node version).
- For security concerns, follow the [Security Policy](./SECURITY.md) instead of filing a public issue.

## Community Expectations

- Be respectful and inclusive. Constructive feedback and shared learning are core values.
- Assume positive intent in reviews and discussions.
- Credit the work of others when building on their contributions.

We appreciate your time and effort in making the Portfolio platform better for everyone!
