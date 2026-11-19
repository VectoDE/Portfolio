// Decides when the realtime provider may call router.refresh(). Kept free of imports so the
// unit tests can load it without dependencies.

export const REALTIME_REFRESH_MIN_INTERVAL_MS = 5_000
export const REALTIME_REFRESH_MAX_INTERVAL_MS = 60_000

/** Realtime is off unless NEXT_PUBLIC_REALTIME_ENABLED is exactly "true". */
export function isRealtimeEnabled(value: string | undefined): boolean {
  return value === "true"
}

/**
 * True for events that carry a data change. Connection notices (socket:connected,
 * socket:disconnected) are not data and must not refresh the page.
 */
export function isDataEvent(payload: unknown): boolean {
  if (typeof payload !== "object" || payload === null) {
    return false
  }

  const event = (payload as { event?: unknown }).event

  return typeof event === "string" && event.length > 0 && !event.startsWith("socket:")
}

export interface RefreshGate {
  onDisconnect(): void
  /** Returns true when this connect is a reconnect after a disconnect and may refresh. */
  onConnect(now: number): boolean
  /** Returns true when the event is a data event and may refresh. */
  onEvent(payload: unknown, now: number): boolean
}

/**
 * The first connect after page load never refreshes. Before, every connect called
 * router.refresh(); on a 404 page Next answers the refresh with a full reload, which opened a new
 * socket, whose connect refreshed again: an endless reload loop (#118).
 *
 * Refreshes are throttled: within the current interval they are dropped and the interval doubles
 * (up to the maximum); after a quiet period of twice the interval it falls back to the minimum.
 */
export function createRefreshGate(
  minIntervalMs = REALTIME_REFRESH_MIN_INTERVAL_MS,
  maxIntervalMs = REALTIME_REFRESH_MAX_INTERVAL_MS,
): RefreshGate {
  let disconnected = false
  let interval = minIntervalMs
  let lastRefresh = Number.NEGATIVE_INFINITY

  function tryRefresh(now: number): boolean {
    const elapsed = now - lastRefresh

    if (elapsed < interval) {
      interval = Math.min(interval * 2, maxIntervalMs)
      return false
    }

    if (elapsed >= interval * 2) {
      interval = minIntervalMs
    }

    lastRefresh = now
    return true
  }

  return {
    onDisconnect() {
      disconnected = true
    },
    onConnect(now) {
      if (!disconnected) {
        return false
      }

      disconnected = false
      return tryRefresh(now)
    },
    onEvent(payload, now) {
      return isDataEvent(payload) && tryRefresh(now)
    },
  }
}

/** Marker on the 404 page; a refresh there would turn into a full reload. */
export const NOT_FOUND_MARKER_ATTRIBUTE = "data-not-found"
