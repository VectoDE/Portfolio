import assert from "node:assert/strict"
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"
import { describe, it } from "node:test"

// Guard for #100: seeding happens only through prisma/seed.mjs on the command line.
// No route may create accounts or sample data over HTTP.

function collect(dir: string): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir).flatMap(entry => {
    const path = join(dir, entry)
    return statSync(path).isDirectory() ? collect(path) : /\.(ts|tsx)$/.test(entry) ? [path] : []
  })
}

describe("seeding", () => {
  it("has no HTTP seed route", () => {
    assert.equal(existsSync(join("app", "api", "seed")), false)
    assert.equal(existsSync(join("pages", "api", "seed.ts")), false)
  })

  it("no source reads SEED_TOKEN or the x-seed-token header", () => {
    for (const file of ["app", "pages", "lib", "components"].flatMap(collect)) {
      const text = readFileSync(file, "utf8")
      assert.equal(/SEED_TOKEN|x-seed-token/i.test(text), false, `${file} must not use a seed token`)
    }
  })
})
