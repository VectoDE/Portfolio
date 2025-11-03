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

export default function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  const existingServer = res.socket.server as typeof res.socket.server & { io?: IOServer }

  if (!existingServer.io) {
    const io = new IOServer(res.socket.server, {
      path: "/api/socket/io",
      cors: {
        origin: process.env.NEXT_PUBLIC_SITE_URL || "*",
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
