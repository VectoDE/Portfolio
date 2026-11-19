import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  careerPublicSelect,
  certificatePublicSelect,
  skillPublicSelect,
} from "../lib/public-fields.ts"

const forbiddenFields = ["userId", "user", "password", "email"]

const selects = {
  career: careerPublicSelect,
  certificate: certificatePublicSelect,
  skill: skillPublicSelect,
}

describe("public field whitelists", () => {
  for (const [model, select] of Object.entries(selects)) {
    it(`${model} select leaves out owner and account fields`, () => {
      for (const field of forbiddenFields) {
        assert.equal(Object.hasOwn(select, field), false, `${model} must not select ${field}`)
      }
    })

    it(`${model} select includes the id and only enabled fields`, () => {
      assert.equal(select.id, true)
      for (const value of Object.values(select)) {
        assert.equal(value, true)
      }
    })
  }
})
