import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { type JsonBodySource, MAX_JSON_BODY_BYTES, readJsonLimited } from "../lib/http.ts"

type BodyInput = string | ReadableStream<Uint8Array> | null

/** Minimal request as the route sees it: headers plus a byte stream. */
function post(body: BodyInput, headers: Record<string, string> = {}): JsonBodySource {
  const stream = typeof body === "string" ? streamOf([new TextEncoder().encode(body)]) : body
  return { headers: new Headers({ "content-type": "application/json", ...headers }), body: stream }
}

function streamOf(chunks: Uint8Array[], onCancel?: () => void): ReadableStream<Uint8Array> {
  let index = 0
  return new ReadableStream<Uint8Array>({
    pull(controller) {
      if (index < chunks.length) {
        controller.enqueue(chunks[index++])
      } else {
        controller.close()
      }
    },
    cancel() {
      onCancel?.()
    },
  })
}

describe("readJsonLimited", () => {
  it("uses a 16 KB default limit", () => {
    assert.equal(MAX_JSON_BODY_BYTES, 16 * 1024)
  })

  it("parses a JSON body below the limit", async () => {
    const result = await readJsonLimited(post(JSON.stringify({ email: "a@example.com", password: "x" })))
    assert.deepEqual(result, { ok: true, body: { email: "a@example.com", password: "x" } })
  })

  it("returns body undefined for malformed JSON, an empty body and no body", async () => {
    assert.deepEqual(await readJsonLimited(post("{not json")), { ok: true, body: undefined })
    assert.deepEqual(await readJsonLimited(post("")), { ok: true, body: undefined })
    assert.deepEqual(await readJsonLimited(post(null)), { ok: true, body: undefined })
  })

  it("accepts a body of exactly the limit", async () => {
    const text = JSON.stringify("a".repeat(98))
    assert.equal(text.length, 100)
    assert.deepEqual(await readJsonLimited(post(text), 100), { ok: true, body: "a".repeat(98) })
  })

  it("refuses a declared Content-Length above the limit without reading the body", async () => {
    let pulled = 0
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        pulled++
        controller.enqueue(new Uint8Array(10))
      },
    })
    const result = await readJsonLimited(post(stream, { "content-length": "101" }), 100)
    assert.deepEqual(result, { ok: false, reason: "too-large" })
    assert.ok(pulled <= 1, `expected at most one buffered pull, got ${pulled}`)
  })

  it("stops reading a chunked body as soon as the limit is exceeded", async () => {
    let cancelled = false
    const chunks = Array.from({ length: 50 }, () => new Uint8Array(40).fill(0x20))
    const result = await readJsonLimited(post(streamOf(chunks, () => (cancelled = true))), 100)
    assert.deepEqual(result, { ok: false, reason: "too-large" })
    assert.equal(cancelled, true)
  })

  it("does not trust a small Content-Length when more bytes arrive", async () => {
    const chunks = [new TextEncoder().encode(`"${"b".repeat(200)}"`)]
    const result = await readJsonLimited(post(streamOf(chunks), { "content-length": "10" }), 100)
    assert.deepEqual(result, { ok: false, reason: "too-large" })
  })

  it("decodes multi-byte UTF-8 split across chunks", async () => {
    const bytes = new TextEncoder().encode(JSON.stringify({ name: "Jürgen" }))
    const split = bytes.indexOf(0xc3) + 1
    const result = await readJsonLimited(post(streamOf([bytes.slice(0, split), bytes.slice(split)])))
    assert.deepEqual(result, { ok: true, body: { name: "Jürgen" } })
  })

  it("treats a broken upload stream as an unreadable body", async () => {
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        controller.error(new Error("connection reset"))
      },
    })
    assert.deepEqual(await readJsonLimited(post(stream)), { ok: true, body: undefined })
  })
})
