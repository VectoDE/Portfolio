import type { NextApiRequest } from "next"
import { Server as IOServer } from "socket.io"
import type { DisconnectReason, Socket } from "socket.io"

import type { NextApiResponseServerIO } from "@/types/next"
import { getRealtimeIO, setRealtimeIO } from "@/lib/realtime"

export const config = {
  api: {
    bodyParser: false,
  },
}

/**
 * Allowed CORS origin from NEXT_PUBLIC_SITE_URL. Browsers send the Origin header without a path
 * or trailing slash, so "https://example.com/" would never match; new URL().origin turns any
 * configured URL into exactly that form. A missing or unparseable value means same-origin only.
 */
function getAllowedOrigin(): string | false {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()

  if (!siteUrl) {
    return false
  }

  try {
    const { origin } = new URL(siteUrl)

    return origin === "null" ? false : origin
  } catch {
    console.warn("NEXT_PUBLIC_SITE_URL is not a valid URL; Socket.IO allows same-origin clients only.")
    return false
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  const existingServer = res.socket.server as typeof res.socket.server & { io?: IOServer }

  if (!existingServer.io) {
    const io = new IOServer(res.socket.server, {
      path: "/api/socket/io",
      cors: {
        // Without a configured site URL only same-origin clients may connect; never fall back
        // to "*", which would let any website open a realtime connection.
        origin: getAllowedOrigin(),
      },
    })

    setRealtimeIO(io)
    existingServer.io = io

    io.on("connection", (socket: Socket) => {
      socket.emit("realtime:event", {
        event: "socket:connected",
        socketId: socket.id,
        timestamp: Date.now(),
      })

      socket.on("disconnect", (reason: DisconnectReason) => {
        socket.broadcast.emit("realtime:event", {
          event: "socket:disconnected",
          socketId: socket.id,
          reason,
          timestamp: Date.now(),
        })
      })
    })
  } else if (!getRealtimeIO()) {
    setRealtimeIO(existingServer.io)
  }

  res.end()
}
