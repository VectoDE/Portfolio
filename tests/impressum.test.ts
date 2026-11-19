import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { impressumProblems, operatorFromEnv } from "../lib/impressum.mjs"

const complete = {
  IMPRESSUM_NAME: " Max Muster ",
  IMPRESSUM_STRASSE: "Musterweg 1",
  IMPRESSUM_PLZ_ORT: "12345 Musterstadt",
  IMPRESSUM_EMAIL: "max@example.org",
}

describe("impressum", () => {
  it("reads a complete operator and trims the values", () => {
    assert.deepEqual(operatorFromEnv(complete), {
      name: "Max Muster",
      street: "Musterweg 1",
      postalCity: "12345 Musterstadt",
      country: "Deutschland",
      email: "max@example.org",
    })
    assert.deepEqual(impressumProblems(complete), [])
  })

  it("returns null and names every missing variable", () => {
    assert.equal(operatorFromEnv({}), null)
    assert.deepEqual(impressumProblems({ ...complete, IMPRESSUM_STRASSE: "  ", IMPRESSUM_EMAIL: undefined }), [
      "IMPRESSUM_STRASSE fehlt",
      "IMPRESSUM_EMAIL fehlt",
    ])
  })

  it("rejects an invalid email address", () => {
    assert.equal(operatorFromEnv({ ...complete, IMPRESSUM_EMAIL: "no-at-sign" }), null)
    assert.deepEqual(impressumProblems({ ...complete, IMPRESSUM_EMAIL: "no-at-sign" }), [
      "IMPRESSUM_EMAIL ist keine gültige E-Mail-Adresse",
    ])
  })
})
