import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { describe, it } from "node:test"

import {
  createRefreshGate,
  isDataEvent,
  isRealtimeEnabled,
  NOT_FOUND_MARKER_ATTRIBUTE,
  REALTIME_REFRESH_MAX_INTERVAL_MS,
  REALTIME_REFRESH_MIN_INTERVAL_MS,
} from "../lib/realtime-refresh.ts"

describe("isRealtimeEnabled", () => {
  it("is on only for the exact value true", () => {
    assert.equal(isRealtimeEnabled("true"), true)
    for (const value of [undefined, "", "false", "1", "TRUE", " true"]) {
      assert.equal(isRealtimeEnabled(value), false)
    }
  })
})

describe("isDataEvent", () => {
  it("ignores connection notices and malformed payloads", () => {
    for (const payload of [
      undefined,
      null,
      "project:updated",
      {},
      { event: "" },
      { event: 42 },
      { event: "socket:connected" },
      { event: "socket:disconnected" },
    ]) {
      assert.equal(isDataEvent(payload), false)
    }
  })

  it("accepts named data events", () => {
    assert.equal(isDataEvent({ event: "project:updated" }), true)
  })
})

describe("createRefreshGate", () => {
  it("never refreshes on the first connect after page load (#118)", () => {
    const gate = createRefreshGate()
    assert.equal(gate.onConnect(0), false)
    // A fresh page after a full reload starts with a new gate, so the reload loop cannot recur.
    assert.equal(createRefreshGate().onConnect(10), false)
  })

  it("ignores the connection notices the server sends on every connect", () => {
    const gate = createRefreshGate()
    gate.onConnect(0)
    assert.equal(gate.onEvent({ event: "socket:connected", socketId: "a" }, 1), false)
    assert.equal(gate.onEvent({ event: "socket:disconnected", socketId: "b" }, 2), false)
  })

  it("refreshes once on a reconnect after a disconnect", () => {
    const gate = createRefreshGate()
    gate.onConnect(0)
    gate.onDisconnect()
    assert.equal(gate.onConnect(1_000), true)
    // A second connect without a new disconnect is not a reconnect.
    assert.equal(gate.onConnect(100_000), false)
  })

  it("throttles bursts and backs off up to the maximum", () => {
    const gate = createRefreshGate(1_000, 4_000)
    const data = { event: "project:updated" }

    assert.equal(gate.onEvent(data, 0), true)
    assert.equal(gate.onEvent(data, 500), false) // interval now 2000
    assert.equal(gate.onEvent(data, 1_500), false) // interval now 4000
    assert.equal(gate.onEvent(data, 3_000), false) // stays at the maximum
    assert.equal(gate.onEvent(data, 4_000), true)
  })

  it("returns to the minimum interval after a quiet period", () => {
    const gate = createRefreshGate(1_000, 8_000)
    const data = { event: "project:updated" }

    gate.onEvent(data, 0)
    gate.onEvent(data, 100) // interval 2000
    gate.onEvent(data, 200) // interval 4000
    assert.equal(gate.onEvent(data, 10_000), true) // quiet for more than 2 x 4000: back to 1000
    assert.equal(gate.onEvent(data, 11_100), true)
  })

  it("uses sane defaults", () => {
    assert.ok(REALTIME_REFRESH_MIN_INTERVAL_MS >= 1_000)
    assert.ok(REALTIME_REFRESH_MAX_INTERVAL_MS >= REALTIME_REFRESH_MIN_INTERVAL_MS)
  })
})

describe("404 page and provider wiring", () => {
  it("marks the 404 page so the provider skips refreshes there", () => {
    const notFound = readFileSync("app/not-found.tsx", "utf8")
    assert.ok(notFound.includes(`${NOT_FOUND_MARKER_ATTRIBUTE}=`), "app/not-found.tsx needs the marker")
  })

  it("keeps the provider from refreshing on every connect", () => {
    const provider = readFileSync("components/realtime-provider.tsx", "utf8")
    assert.ok(provider.includes("NEXT_PUBLIC_REALTIME_ENABLED"))
    assert.ok(provider.includes("createRefreshGate"))
    assert.ok(provider.includes("NOT_FOUND_MARKER_ATTRIBUTE"))
    assert.equal(/on\("connect",\s*\(\)\s*=>\s*\{?\s*router\.refresh/.test(provider), false)
    assert.ok(existsSync("lib/realtime-refresh.ts"))
  })
})
