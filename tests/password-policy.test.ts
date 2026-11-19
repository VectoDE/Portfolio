import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  PASSWORD_MIN_LENGTH,
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
