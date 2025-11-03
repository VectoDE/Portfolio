import type { Server as IOServer } from "socket.io"

const globalForRealtime = globalThis as unknown as {
  realtimeIO?: IOServer
}

export function getRealtimeIO() {
  return globalForRealtime.realtimeIO
}

export function setRealtimeIO(io: IOServer) {
  globalForRealtime.realtimeIO = io
  return io
}
