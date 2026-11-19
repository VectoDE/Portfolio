import assert from "node:assert/strict"
import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"
import { describe, it } from "node:test"

// Guard for #83: no code may forward raw Prisma mutation data (args/result)
// to Socket.IO clients. The old middleware sent every mutation, including
// userId and email, to all connected sockets.

const roots = ["lib", "app", "pages", "components"]

function collectSources(dir: string): string[] {
  const files: string[] = []
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) {
      files.push(...collectSources(path))
    } else if (/\.(ts|tsx)$/.test(entry)) {
      files.push(path)
    }
  }
  return files
}

const sources = roots.flatMap(root => collectSources(root))

describe("realtime events", () => {
  it("no Prisma middleware is registered for realtime broadcasts", () => {
    for (const file of sources) {
      const text = readFileSync(file, "utf8")
      assert.equal(/\$use\s*\(/.test(text), false, `${file} must not register Prisma middleware`)
      assert.equal(
        text.includes("registerPrismaRealtime"),
        false,
        `${file} must not use registerPrismaRealtime`,
      )
    }
  })

  it("no event payload forwards raw mutation args or results", () => {
    for (const file of sources) {
      const text = readFileSync(file, "utf8")
      assert.equal(
        /args:\s*params\.args/.test(text),
        false,
        `${file} must not forward raw Prisma args`,
      )
    }
  })
})
