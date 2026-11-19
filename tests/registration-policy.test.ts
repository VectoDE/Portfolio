import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  classifyRegistrationError,
  decideRegistration,
  evaluateRegistrationRequest,
  isRegistrationOpen,
  normalizeEmail,
  oversizedBodyResponse,
  REGISTRATION_CLOSED_MESSAGE,
  REGISTRATION_NOT_COMPLETED_MESSAGE,
  REQUEST_TOO_LARGE_MESSAGE,
} from "../lib/registration-policy.ts"

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

describe("evaluateRegistrationRequest on an empty database", () => {
  const base = { existingUsers: 0, registrationEnabled: false, bootstrapEmail: BOOTSTRAP }

  it("refuses every request without the bootstrap address before validating anything", () => {
    const bodies: unknown[] = [
      undefined, // broken JSON
      null,
      {},
      [],
      "owner@example.com",
      { password: "long-enough-password" },
      { email: "attacker@example.com" },
      { email: "attacker@example.com", password: "short" },
      { email: 42, password: "long-enough-password" },
    ]

    for (const body of bodies) {
      assert.deepEqual(evaluateRegistrationRequest({ ...base, body }), {
        outcome: "refuse",
        decision: { outcome: "bootstrap-email-mismatch" },
      })
    }
  })

  it("refuses everything while ADMIN_BOOTSTRAP_EMAIL is not configured", () => {
    for (const body of [undefined, {}, { email: BOOTSTRAP, password: "long-enough-password" }]) {
      assert.deepEqual(evaluateRegistrationRequest({ ...base, bootstrapEmail: "", body }), {
        outcome: "refuse",
        decision: { outcome: "bootstrap-not-configured" },
      })
    }
  })

  it("validates the password only after the address matched", () => {
    assert.deepEqual(evaluateRegistrationRequest({ ...base, body: { email: BOOTSTRAP } }), {
      outcome: "invalid",
      error: "Email and password are required",
    })
    assert.deepEqual(
      evaluateRegistrationRequest({ ...base, body: { email: BOOTSTRAP, password: "short" } }),
      { outcome: "invalid", error: "Password must be at least 8 characters long" },
    )
  })

  it("lets the bootstrap address through as admin with normalized fields", () => {
    assert.deepEqual(
      evaluateRegistrationRequest({
        ...base,
        body: { email: " Owner@Example.com ", password: "long-enough-password", name: "  Ada " },
      }),
      {
        outcome: "proceed",
        email: BOOTSTRAP,
        password: "long-enough-password",
        name: "Ada",
        admin: true,
      },
    )
  })
})

describe("evaluateRegistrationRequest with existing accounts", () => {
  it("refuses as closed when ALLOW_REGISTRATION is off, whatever the body", () => {
    for (const body of [undefined, {}, { email: "a@example.com", password: "long-enough-password" }]) {
      assert.deepEqual(
        evaluateRegistrationRequest({
          existingUsers: 2,
          registrationEnabled: false,
          bootstrapEmail: BOOTSTRAP,
          body,
        }),
        { outcome: "refuse", decision: { outcome: "closed" } },
      )
    }
  })

  it("validates input when ALLOW_REGISTRATION is on and creates members", () => {
    const open = { existingUsers: 2, registrationEnabled: true, bootstrapEmail: BOOTSTRAP }

    assert.deepEqual(evaluateRegistrationRequest({ ...open, body: undefined }), {
      outcome: "invalid",
      error: "Invalid request body",
    })
    assert.deepEqual(evaluateRegistrationRequest({ ...open, body: { password: "long-enough" } }), {
      outcome: "invalid",
      error: "Email and password are required",
    })
    assert.deepEqual(
      evaluateRegistrationRequest({ ...open, body: { email: "a@example.com", password: "short" } }),
      { outcome: "invalid", error: "Password must be at least 8 characters long" },
    )
    assert.deepEqual(
      evaluateRegistrationRequest({
        ...open,
        body: { email: "A@Example.com", password: "long-enough", name: 7 },
      }),
      { outcome: "proceed", email: "a@example.com", password: "long-enough", name: null, admin: false },
    )
  })
})

describe("classifyRegistrationError", () => {
  it("maps Prisma P2034 to a retryable 409", () => {
    const failure = classifyRegistrationError(
      Object.assign(new Error("Transaction failed due to a write conflict or a deadlock"), {
        code: "P2034",
      }),
    )
    assert.equal(failure.status, 409)
    assert.equal(failure.code, "P2034")
    assert.doesNotMatch(failure.message, /deadlock|conflict/i)
  })

  const uniqueViolation = () =>
    Object.assign(new Error("Unique constraint failed on the fields: (`email`)"), {
      code: "P2002",
      meta: { target: ["email"] },
    })

  it("maps Prisma P2002 to the generic closed response during the first registration", () => {
    for (const failure of [
      classifyRegistrationError(uniqueViolation()),
      classifyRegistrationError(uniqueViolation(), { openRegistration: false }),
    ]) {
      assert.deepEqual(
        { status: failure.status, message: failure.message, code: failure.code },
        { status: 403, message: REGISTRATION_CLOSED_MESSAGE, code: "P2002" },
      )
    }
  })

  it("maps Prisma P2002 to 'could not be completed' when registration is open", () => {
    const failure = classifyRegistrationError(uniqueViolation(), { openRegistration: true })
    assert.deepEqual(
      { status: failure.status, message: failure.message, code: failure.code },
      { status: 409, message: REGISTRATION_NOT_COMPLETED_MESSAGE, code: "P2002" },
    )
    assert.notEqual(failure.message, REGISTRATION_CLOSED_MESSAGE)
  })

  it("keeps other errors at 500 and never copies the error message into the log fields", () => {
    const secret = "postgres://user:hunter2@db/app owner@example.com"
    for (const error of [new TypeError(secret), Object.assign(new Error(secret), { code: "P1001" }), secret, null]) {
      const failure = classifyRegistrationError(error)
      assert.equal(failure.status, 500)
      assert.equal(failure.message, "Something went wrong")
      assert.ok(!failure.code.includes("hunter2") && !failure.reason.includes("hunter2"))
      assert.ok(!failure.reason.includes("owner@example.com"))
    }
  })
})

describe("isRegistrationOpen", () => {
  it("is true only with existing accounts and ALLOW_REGISTRATION on", () => {
    assert.equal(isRegistrationOpen({ existingUsers: 1, registrationEnabled: true }), true)
    assert.equal(isRegistrationOpen({ existingUsers: 1, registrationEnabled: false }), false)
    assert.equal(isRegistrationOpen({ existingUsers: 0, registrationEnabled: true }), false)
    assert.equal(isRegistrationOpen({ existingUsers: 0, registrationEnabled: false }), false)
  })
})

describe("oversizedBodyResponse", () => {
  it("answers like a closed registration on an empty database and with closed registration", () => {
    const expected = { status: 403, message: REGISTRATION_CLOSED_MESSAGE }
    assert.deepEqual(oversizedBodyResponse({ existingUsers: 0, registrationEnabled: false }), expected)
    assert.deepEqual(oversizedBodyResponse({ existingUsers: 0, registrationEnabled: true }), expected)
    assert.deepEqual(oversizedBodyResponse({ existingUsers: 3, registrationEnabled: false }), expected)
  })

  it("answers 413 with a generic message only when registration is open", () => {
    assert.deepEqual(oversizedBodyResponse({ existingUsers: 3, registrationEnabled: true }), {
      status: 413,
      message: REQUEST_TOO_LARGE_MESSAGE,
    })
  })
})
