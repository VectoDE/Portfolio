import type { Server as HttpServer } from "http"
import type { Server as IOServer } from "socket.io"
import type { NextApiResponse } from "next"

export type NextApiResponseServerIO = NextApiResponse & {
  socket: NextApiResponse["socket"] & {
    server: HttpServer & {
      io?: IOServer
    }
  }
}
