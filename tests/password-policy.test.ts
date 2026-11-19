import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  PASSWORD_MAX_BYTES,
  PASSWORD_MIN_LENGTH,
  PASSWORD_TOO_LONG_MESSAGE,
  PASSWORD_TOO_SHORT_MESSAGE,
  validatePassword,
} from "../lib/password-policy.ts"

describe("validatePassword", () => {
  it("requires at least eight characters", () => {
    assert.equal(PASSWORD_MIN_LENGTH, 8)
    assert.equal(validatePassword("1234567"), PASSWORD_TOO_SHORT_MESSAGE)
    assert.equal(validatePassword("12345678"), null)
  })

  it("rejects values that are not strings", () => {
    assert.equal(validatePassword(undefined), PASSWORD_TOO_SHORT_MESSAGE)
    assert.equal(validatePassword(12345678), PASSWORD_TOO_SHORT_MESSAGE)
    assert.equal(validatePassword(["12345678"]), PASSWORD_TOO_SHORT_MESSAGE)
  })

  it("keeps the message in sync with the minimum length", () => {
    const expected = new RegExp(`at least ${PASSWORD_MIN_LENGTH} characters`)

    assert.match(PASSWORD_TOO_SHORT_MESSAGE, expected)
  })
})

describe("validatePassword upper limit", () => {
  it("accepts exactly 72 bytes and rejects 73", () => {
    assert.equal(PASSWORD_MAX_BYTES, 72)
    assert.equal(validatePassword("a".repeat(72)), null)
    assert.equal(validatePassword("a".repeat(73)), PASSWORD_TOO_LONG_MESSAGE)
  })

  it("counts UTF-8 bytes, not characters", () => {
    // "ä" is two bytes in UTF-8: 36 of them are 72 bytes, 37 are 74.
    assert.equal(validatePassword("ä".repeat(36)), null)
    assert.equal(validatePassword("ä".repeat(37)), PASSWORD_TOO_LONG_MESSAGE)
  })

  it("keeps the message in sync with the byte limit", () => {
    assert.match(PASSWORD_TOO_LONG_MESSAGE, new RegExp(`at most ${PASSWORD_MAX_BYTES} bytes`))
  })
})
