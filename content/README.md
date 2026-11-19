# Portfolio content

The public pages show the data in these files. They are the single source for:

- `prisma/seed.mjs`, which writes them into the MySQL database, and
- `lib/content.ts`, which serves them directly when no database is configured or a
  query fails (for example on preview deployments).

| File | Content | Source |
|---|---|---|
| `profile.json` | Name, role, about text, services, education, public contact and links | GitHub profile `VectoDE/VectoDE`, CV (professional details only) |
| `projects.json` | Projects with features, links and year | GitHub profile, public repositories |
| `career.json` | Roles and periods | GitHub profile timeline, CV |
| `certificates.json` | Course certificates with verification or PDF link | GitHub profile, `VectoDE/VectoDE/certificates` |
| `skills.json` | Technologies with public or private code behind them | GitHub profile (`tech.py`, entries with evidence) |

Rules:

- No private data: no home address, date of birth or private phone numbers.
- No invented numbers. Years of experience per skill are not recorded, so `years` is `0`
  and the pages do not show it. Levels are `Core`, `Public code` or `Private code`.
- Ids are fixed (`tellersonne`, `skill-typescript`, ...), so project URLs are the same
  with and without a database.

## Seeding

```bash
pnpm exec prisma db push
SEED_OWNER_EMAIL=you@example.com node prisma/seed.mjs            # create missing entries
SEED_OWNER_EMAIL=you@example.com node prisma/seed.mjs --update   # overwrite with the JSON
```

The content is attached to the first admin account. `SEED_OWNER_EMAIL` is only used when
no admin exists yet; without `SEED_OWNER_PASSWORD` that account gets a random password.
