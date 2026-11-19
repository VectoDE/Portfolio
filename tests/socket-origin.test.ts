import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { getAllowedOrigin } from "../lib/socket-origin.ts"

describe("getAllowedOrigin", () => {
  it("allows same-origin only when NEXT_PUBLIC_SITE_URL is missing or blank", () => {
    for (const value of [undefined, "", "   "]) {
      assert.equal(getAllowedOrigin(value), false)
    }
  })

  it("reduces a configured URL to its origin", () => {
    assert.equal(getAllowedOrigin("https://example.com/"), "https://example.com")
    assert.equal(getAllowedOrigin(" https://example.com/some/path?q=1 "), "https://example.com")
    assert.equal(getAllowedOrigin("http://localhost:3000"), "http://localhost:3000")
    assert.equal(getAllowedOrigin("HTTPS://Example.COM:443/"), "https://example.com")
  })

  it("falls back to same-origin and warns for invalid URLs", () => {
    const warnings: string[] = []
    assert.equal(getAllowedOrigin("not a url", message => warnings.push(message)), false)
    assert.equal(warnings.length, 1)
  })

  it("never returns the opaque origin null or a wildcard", () => {
    for (const value of ["file:///etc/passwd", "data:text/plain,x", "*"]) {
      const result = getAllowedOrigin(value, () => {})
      assert.notEqual(result, "null")
      assert.notEqual(result, "*")
      assert.equal(result, false)
    }
  })
})
