import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  CLIENT_LOG_MAX_BODY_BYTES,
  CLIENT_LOG_MAX_LENGTH,
  sanitizeClientLogMessage,
  shouldUseFileLogs,
} from "../lib/log-config.ts"

describe("shouldUseFileLogs", () => {
  it("writes files on a normal server", () => {
    assert.equal(shouldUseFileLogs({}), true)
  })

  it("skips files on serverless platforms", () => {
    assert.equal(shouldUseFileLogs({ VERCEL: "1" }), false)
    assert.equal(shouldUseFileLogs({ NETLIFY: "true" }), false)
    assert.equal(shouldUseFileLogs({ AWS_LAMBDA_FUNCTION_NAME: "fn" }), false)
  })

  it("follows LOG_TO_FILE when set", () => {
    assert.equal(shouldUseFileLogs({ LOG_TO_FILE: "false" }), false)
    assert.equal(shouldUseFileLogs({ VERCEL: "1", LOG_TO_FILE: "true" }), true)
  })
})

describe("sanitizeClientLogMessage", () => {
  it("rejects values that are not non-empty strings", () => {
    for (const value of [undefined, null, 42, {}, ["x"], "", "  \n "]) {
      assert.equal(sanitizeClientLogMessage(value), null)
    }
  })

  it("replaces line breaks and control characters so no log line can be forged", () => {
    const result = sanitizeClientLogMessage("ok\r\n2026-01-01 00:00:00 error: forged\u2028x\u0007")
    assert.equal(result, "ok  2026-01-01 00:00:00 error: forged x")
    // eslint-disable-next-line no-control-regex -- checks on purpose that control characters were removed
    assert.equal(/[\r\n\u2028\u0007]/.test(result ?? ""), false)
  })

  it("caps the length", () => {
    const result = sanitizeClientLogMessage("a".repeat(CLIENT_LOG_MAX_LENGTH + 50))
    assert.equal(result, `${"a".repeat(CLIENT_LOG_MAX_LENGTH)}…`)
  })
})

describe("sanitizeClientLogMessage, Unicode", () => {
  it("removes bidi overrides, zero-width characters, BOM, NEL and ESC", () => {
    const input = "a\u202Eb\u2066c\u200Bd\uFEFFe\u0085f\u001b[31mg"
    const result = sanitizeClientLogMessage(input) ?? ""
    // eslint-disable-next-line no-control-regex -- checks on purpose that control characters were removed
    assert.equal(/[\u202E\u2066\u200B\uFEFF\u0085\u001b]/.test(result), false)
    assert.equal(result, "a b c d e f [31mg")
  })

  it("does not split a surrogate pair when cutting", () => {
    const input = `${"a".repeat(CLIENT_LOG_MAX_LENGTH - 1)}\u{1F600}tail`
    const result = sanitizeClientLogMessage(input) ?? ""
    assert.equal(result, `${"a".repeat(CLIENT_LOG_MAX_LENGTH - 1)}…`)
    assert.equal(result.isWellFormed(), true)
  })
})

describe("CLIENT_LOG_MAX_BODY_BYTES", () => {
  it("is a small fixed limit", () => {
    assert.equal(CLIENT_LOG_MAX_BODY_BYTES, 4096)
  })
})
