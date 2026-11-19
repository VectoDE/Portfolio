import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { PASSWORD_TOO_LONG_MESSAGE, PASSWORD_TOO_SHORT_MESSAGE, validatePassword } from "../lib/password-policy.ts"
import { resolveSeedAdminPassword } from "../lib/seed-password.ts"

describe("resolveSeedAdminPassword", () => {
  it("generates a password that passes the rule when none is configured", () => {
    for (const configured of [undefined, ""]) {
      const result = resolveSeedAdminPassword(configured)
      assert.equal(result.ok, true)
      if (result.ok) {
        assert.equal(result.generated, true)
        assert.equal(validatePassword(result.password), null)
      }
    }
  })

  it("rejects a configured password that is too short", () => {
    assert.deepEqual(resolveSeedAdminPassword("1234567"), {
      ok: false,
      error: `SEED_ADMIN_PASSWORD: ${PASSWORD_TOO_SHORT_MESSAGE}`,
    })
  })

  it("rejects a configured password longer than 72 bytes", () => {
    assert.deepEqual(resolveSeedAdminPassword("ä".repeat(37)), {
      ok: false,
      error: `SEED_ADMIN_PASSWORD: ${PASSWORD_TOO_LONG_MESSAGE}`,
    })
  })

  it("uses a valid configured password unchanged", () => {
    assert.deepEqual(resolveSeedAdminPassword("correct horse battery"), {
      ok: true,
      password: "correct horse battery",
      generated: false,
    })
  })
})
