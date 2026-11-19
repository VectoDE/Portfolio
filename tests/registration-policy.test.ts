import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { decideRegistration, normalizeEmail } from "../lib/registration-policy.ts"

const BOOTSTRAP = "owner@example.com"

describe("decideRegistration on an empty database", () => {
  it("refuses the first account when ADMIN_BOOTSTRAP_EMAIL is missing", () => {
    for (const registrationEnabled of [false, true]) {
      assert.deepEqual(
        decideRegistration({
          existingUsers: 0,
          registrationEnabled,
          email: BOOTSTRAP,
          bootstrapEmail: undefined,
        }),
        { outcome: "bootstrap-not-configured" },
      )
    }
  })

  it("refuses the first account when ADMIN_BOOTSTRAP_EMAIL is empty or blank", () => {
    for (const bootstrapEmail of ["", "   ", "\t\n"]) {
      assert.deepEqual(
        decideRegistration({
          existingUsers: 0,
          registrationEnabled: true,
          email: BOOTSTRAP,
          bootstrapEmail,
        }),
        { outcome: "bootstrap-not-configured" },
      )
    }
  })

  it("refuses a first account with a different email", () => {
    for (const email of ["attacker@example.com", "owner@example.org", "owner+x@example.com", ""]) {
      assert.deepEqual(
        decideRegistration({
          existingUsers: 0,
          registrationEnabled: true,
          email,
          bootstrapEmail: BOOTSTRAP,
        }),
        { outcome: "bootstrap-email-mismatch" },
      )
    }
  })

  it("accepts the bootstrap address regardless of case and surrounding whitespace", () => {
    const cases: Array<[string, string]> = [
      ["owner@example.com", "owner@example.com"],
      ["  Owner@Example.COM ", "owner@example.com"],
      ["owner@example.com", "  OWNER@example.com\n"],
      ["\tOWNER@EXAMPLE.COM", " Owner@Example.Com "],
    ]

    for (const [email, bootstrapEmail] of cases) {
      assert.deepEqual(
        decideRegistration({ existingUsers: 0, registrationEnabled: false, email, bootstrapEmail }),
        { outcome: "create", admin: true },
      )
    }
  })
})

describe("decideRegistration with existing accounts", () => {
  it("stays closed unless ALLOW_REGISTRATION is on, whatever ADMIN_BOOTSTRAP_EMAIL says", () => {
    for (const bootstrapEmail of [undefined, "", BOOTSTRAP]) {
      assert.deepEqual(
        decideRegistration({
          existingUsers: 1,
          registrationEnabled: false,
          email: BOOTSTRAP,
          bootstrapEmail,
        }),
        { outcome: "closed" },
      )
    }
  })

  it("creates members, never admins, when ALLOW_REGISTRATION is on", () => {
    for (const bootstrapEmail of [undefined, "", BOOTSTRAP]) {
      for (const email of [BOOTSTRAP, "someone@example.com"]) {
        assert.deepEqual(
          decideRegistration({ existingUsers: 3, registrationEnabled: true, email, bootstrapEmail }),
          { outcome: "create", admin: false },
        )
      }
    }
  })
})

describe("normalizeEmail", () => {
  it("trims and lowercases strings", () => {
    assert.equal(normalizeEmail("  Foo@Bar.DE "), "foo@bar.de")
  })

  it("returns an empty string for non-strings", () => {
    assert.equal(normalizeEmail(undefined), "")
    assert.equal(normalizeEmail(null), "")
    assert.equal(normalizeEmail(42), "")
  })
})
