import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { decideAuthz } from "../lib/authz-decision.ts"

describe("decideAuthz", () => {
  it("rejects sessions whose account no longer exists", () => {
    assert.equal(decideAuthz(null), "unauthorized")
    assert.equal(decideAuthz(undefined), "unauthorized")
    assert.equal(decideAuthz(null, "Admin"), "unauthorized")
  })

  it("accepts any existing account when no role is required", () => {
    assert.equal(decideAuthz({ role: "Member" }), "ok")
    assert.equal(decideAuthz({ role: null }), "ok")
  })

  it("requires the exact role when one is given", () => {
    assert.equal(decideAuthz({ role: "Admin" }, "Admin"), "ok")
    assert.equal(decideAuthz({ role: "Member" }, "Admin"), "forbidden")
    assert.equal(decideAuthz({ role: null }, "Admin"), "forbidden")
    assert.equal(decideAuthz({ role: "admin" }, "Admin"), "forbidden")
  })
})
