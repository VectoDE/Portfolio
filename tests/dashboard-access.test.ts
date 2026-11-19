import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { decideDashboardAccess } from "../lib/dashboard-access.ts"

describe("decideDashboardAccess", () => {
  it("sends visitors without a session to the login page", () => {
    assert.equal(decideDashboardAccess({ userId: undefined, isAdmin: false }), "login")
    assert.equal(decideDashboardAccess({ userId: null, isAdmin: false }), "login")
    assert.equal(decideDashboardAccess({ userId: "", isAdmin: false }), "login")
  })

  it("never lets a missing session through, even if isAdmin is set", () => {
    assert.equal(decideDashboardAccess({ userId: undefined, isAdmin: true }), "login")
  })

  it("rejects signed-in users without the admin role", () => {
    assert.equal(decideDashboardAccess({ userId: "user-1", isAdmin: false }), "forbidden")
  })

  it("allows signed-in admins", () => {
    assert.equal(decideDashboardAccess({ userId: "user-1", isAdmin: true }), "allow")
  })
})
