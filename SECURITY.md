# Security Policy

We are committed to protecting users of the Portfolio platform and appreciate responsible disclosures that help keep the project safe.

## Supported Versions

Security fixes target the latest commit on the `main` branch. Downstream forks or tagged releases should regularly merge `main` to receive updates.

| Version | Supported |
| --- | --- |
| `main` | ✅ |
| Tagged releases prior to `1.0.0` | ⚠️ Best effort |

## Reporting a Vulnerability

Please report vulnerabilities through one of the following private channels:

1. **GitHub Private Vulnerability Reporting** – Use the “Report a vulnerability” button on the repository’s **Security** tab to open a confidential advisory.
2. **Direct Contact** – If the GitHub channel is unavailable, contact the maintainers through the email address listed on their profile. Use the subject line `'[Portfolio] Vulnerability Disclosure'`.

When reporting, include:

- A concise description of the issue and potential impact.
- Steps to reproduce or proof-of-concept code.
- Affected routes, environment prerequisites, and any relevant logs.
- Suggested mitigations or temporary workarounds.
- Preferred contact information for follow-up.

Do **not** open public issues or pull requests containing sensitive details before a fix is coordinated.

## What to Expect

- **Acknowledgement** – We aim to acknowledge new reports within **3 business days**.
- **Assessment** – Issues are triaged for severity and reproducibility. We may request additional context or testing details.
- **Remediation** – Critical vulnerabilities are prioritised. When a fix is ready, we will coordinate a disclosure timeline with you.
- **Credit** – With your permission, we are happy to credit reporters in release notes or advisories.

## Scope

This policy covers the code and configurations maintained in this repository, including:

- Next.js application code (`app`, `components`, `hooks`, `lib`, `types`).
- API routes, server actions, and background jobs.
- Database schema and migrations under `prisma/`.
- Build tooling and configuration files that ship with the project.

Third-party services (hosting, SMTP providers, analytics vendors, etc.) are out of scope. Please report their issues directly to the relevant provider.

## Data Handling & Privacy

- Visitor analytics (`PageView`, `Analytics`) hash IP addresses with `IP_HASH_SALT` before persistence to limit personal data exposure.
- Contact form submissions store names, emails, and messages for follow-up. Administrators should purge or anonymise old messages according to their compliance obligations.
- Uploaded media is stored on disk at `public/uploads/`. Restrict filesystem permissions in production and prefer object storage for long-term deployments.
- Email settings and credentials are persisted in `EmailSettings`. Rotate secrets regularly and restrict database access.

## First-Time Setup

On an empty database, `POST /api/register` accepts exactly one address, the value of `ADMIN_BOOTSTRAP_EMAIL` (compared after trimming and lowercasing), and only together with the secret in `ADMIN_BOOTSTRAP_TOKEN` (body field `bootstrapToken`, surrounding spaces ignored). The token is compared in constant time over SHA-256 digests, so neither its content nor its length shows in the response time. Both checks always run. That account becomes the admin. The behaviour is fail closed:

- `ADMIN_BOOTSTRAP_EMAIL` unset or empty, or `ADMIN_BOOTSTRAP_TOKEN` unset, empty or shorter than 32 characters: the first registration is refused with `403`.
- A different address or a missing or wrong token: refused with `403`.
- All cases return the same message as a closed registration, so a caller cannot tell whether the instance is still waiting for its first admin or which check failed.
- Malformed JSON and missing fields get the same `403` while the database is empty. Other validations, such as `400` for a password shorter than 8 characters, only run after address and token matched.
- Database conflicts are answered without details: Prisma `P2034` (serialization conflict or deadlock) as `409`, `P2002` (unique constraint) as the generic `403` during the first registration and as `409` `Registration could not be completed.` when registration is open. The log records only the error code and a short reason, never the error object.
- The request body is limited to 16 KB and always read (up to that limit) before any decision, in every branch. A `Content-Length` above the limit is refused without reading; a longer stream is cancelled once the counter passes the limit. While the database is empty or registration is closed, an oversized body gets the same `403`; only open registration answers `413`. This keeps a large or slowly sent body from revealing an unclaimed instance through response timing.
- The decision is repeated inside the serializable transaction that creates the account, so concurrent first registrations cannot both become admin.

> **Upgrading an instance that has no account yet:** since `ADMIN_BOOTSTRAP_TOKEN` was introduced, an empty instance stays closed until the token is set as well. Setting only `ADMIN_BOOTSTRAP_EMAIL` is no longer enough. Instances that already have an account are not affected.

Once any account exists, `ADMIN_BOOTSTRAP_EMAIL` and `ADMIN_BOOTSTRAP_TOKEN` have no effect; `ALLOW_REGISTRATION` alone decides, and new accounts are always `Member`. `ADMIN_BOOTSTRAP_EMAIL` is separate from `ADMIN_EMAIL`, which only sets the recipient of contact notifications.

### Initial Setup After Deployment

1. Register the admin account with the `ADMIN_BOOTSTRAP_EMAIL` address and the `ADMIN_BOOTSTRAP_TOKEN` right after the deploy.
2. Sign in and confirm the admin dashboard is available. The setup is only finished once this works.
3. Remove `ADMIN_BOOTSTRAP_TOKEN` from the environment. The address is often public (for example the contact address on the site); the token is the part that must stay secret until the first account exists.

## Hardening Checklist

Before deploying to production, review the following safeguards:

- Set `ADMIN_BOOTSTRAP_EMAIL` to the operator's address and `ADMIN_BOOTSTRAP_TOKEN` to a random secret of at least 32 characters before the instance is publicly reachable, create the admin account, then remove the token. Keep `ALLOW_REGISTRATION` off unless members should sign up themselves.
- Generate strong values for `NEXTAUTH_SECRET`, `IP_HASH_SALT`, SMTP credentials, and database passwords. Store them securely.
- Serve all traffic over HTTPS and configure trusted reverse proxies so `x-forwarded-for` headers are reliable.
- Limit dashboard access to trusted operators. Consider additional identity providers or IP allowlists when possible.
- Enable rate limiting and CAPTCHA or similar protections on the public contact form if exposed to untrusted traffic.
- Regularly update dependencies (`pnpm update`, `pnpm audit`) and apply Prisma migrations promptly.
- Monitor `logs/` for suspicious activity and forward logs to a central logging solution when available.

## Compliance Alignment

- **OWASP Top 10** – Input validation, authentication, and session handling follow OWASP recommendations.
- **ISO/IEC 27001** – Development practices (change control, least privilege) are designed to slot into an ISMS aligned with ISO/IEC 27001.
- **BSI IT-Grundschutz & NIS-2** – Incident response expectations and notification cadences align with European regulatory guidance, including Germany’s IT-Sicherheitsgesetz.

## Responsible Disclosure Recognition

We appreciate the time and effort required to investigate potential vulnerabilities. With your consent, we will acknowledge responsible reporters in release notes or a dedicated hall of fame once a fix is shipped.

Thank you for helping us keep the Portfolio platform secure.
