// Runs before `next build`. A production deployment on Vercel (VERCEL_ENV=production) stops when an
// Impressum detail is missing; every other build (local, CI, preview) only warns, and the pages
// then show a placeholder notice instead of the Impressum.
import { impressumProblems } from "../lib/impressum.mjs"

const problems = impressumProblems(process.env)

if (problems.length === 0) {
  console.log("Impressum: alle Angaben vorhanden.")
} else {
  const production = process.env.VERCEL_ENV === "production" || process.env.IMPRESSUM_REQUIRED === "true"
  const log = production ? console.error : console.warn
  log(
    production
      ? "Impressum unvollständig, der Produktions-Build bricht ab. Bitte in Vercel unter Settings → Environment Variables setzen:"
      : "Warnung: Impressum unvollständig. Impressum und Datenschutz zeigen einen Platzhalterhinweis. Fehlend:",
  )
  for (const problem of problems) log(`  ${problem}`)
  if (production) process.exit(1)
}
