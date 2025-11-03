"use client"

import { io, type Socket } from "socket.io-client"

let socketInstance: Socket | null = null

export function getRealtimeClient() {
  if (typeof window === "undefined") {
    return null
  }

  if (!socketInstance) {
    socketInstance = io({
      path: "/api/socket/io",
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    })
  }

  return socketInstance
}
