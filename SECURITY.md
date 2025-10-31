# Security Policy

## Supported Versions

Security fixes are applied to the latest commit on the `main` branch. Downstream forks or tagged releases should regularly merge from `main` to receive updates.

| Version                          | Supported           |
| -------------------------------- | ------------------- |
| `main`                           | ✅                  |
| Tagged releases prior to `1.0.0` | ⚠️ Best-effort only |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a vulnerability, please use one of the following private channels:

1. **GitHub Private Vulnerability Reporting** – Use the "Report a vulnerability" button on the repository's **Security** tab to open a confidential advisory.
2. **Direct Contact** – If private vulnerability reporting is unavailable for you, reach out to the maintainers through the contact information listed on their GitHub profile. Please use the subject line "[Portfolio] Vulnerability Disclosure".

When reporting, please include:

- A concise description of the issue and potential impact.
- Steps to reproduce or proof-of-concept code.
- Any suggested mitigations.
- Your availability for follow-up questions.

Please do **not** create public issues or pull requests that disclose the vulnerability before we have a fix in place.

## What to Expect

- **Acknowledgement**: We aim to acknowledge receipt within **3 business days**.
- **Assessment**: Issues are triaged for severity and reproducibility. We may contact you for additional context or testing details.
- **Remediation**: Once a fix is developed, we will coordinate disclosure timing with you. Critical vulnerabilities are addressed with the highest priority.
- **Credit**: With your consent, we are happy to credit reporters in release notes or advisories after a fix has shipped.

## Scope

This policy covers the code and configurations maintained in this repository, including:

- Next.js application code (`app`, `components`, `hooks`, `lib`, `types`).
- API routes and server-side logic.
- Database schema definitions under `prisma/`.
- Build tooling and configuration files that ship with the project.

Third-party services (e.g., hosting platforms, SMTP providers, analytics vendors) are out of scope; please contact those providers directly.

## Security Best Practices

If you deploy or extend this project, consider the following hardening steps:

- Configure strong `NEXTAUTH_SECRET` and rotate credentials regularly.
- Restrict database access with least-privilege accounts and TLS connections.
- Limit dashboard access behind HTTPS and trusted identity providers.
- Monitor dependency updates and run `pnpm update` / `pnpm audit` on a regular cadence.
- Enable rate limiting and CAPTCHA on public forms if exposing the site to production traffic.

## Compliance with Industry Standards

- **OWASP Top 10** – Security controls and testing procedures are aligned with the OWASP Top 10 categories to mitigate the most
  prevalent web application risks.
- **ISO/IEC 27001** – Operational processes are designed to integrate into an Information Security Management System (ISMS)
  consistent with ISO/IEC 27001, including regular risk assessments, documented controls, and continuous improvement loops.
- **BSI IT-Grundschutz** – Technical and organizational safeguards take guidance from the BSI IT-Grundschutz catalogs to
  achieve an appropriate level of protection for confidentiality, integrity, and availability.
- **NIS-2 / IT-Sicherheitsgesetz** – Incident response and notification processes meet the requirements of the German
  IT-Sicherheitsgesetz and the EU NIS-2 directive for rapid detection, reporting, and remediation of significant events.

Thank you for helping us keep the Portfolio platform secure.
