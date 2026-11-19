"use client"

import type { ReactNode } from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getRealtimeClient } from "@/lib/realtime-client"
import { createRefreshGate, isRealtimeEnabled, NOT_FOUND_MARKER_ATTRIBUTE } from "@/lib/realtime-refresh"

interface RealtimeProviderProps {
  children: ReactNode
}

// Inlined at build time. Without it no socket is opened, which also covers hosts without a
// Socket.IO server such as Vercel.
const REALTIME_ENABLED = isRealtimeEnabled(process.env.NEXT_PUBLIC_REALTIME_ENABLED)

export function RealtimeProvider({ children }: Readonly<RealtimeProviderProps>) {
  const router = useRouter()

  useEffect(() => {
    if (!REALTIME_ENABLED) {
      return
    }

    const controller = new AbortController()

    fetch("/api/socket/io", { signal: controller.signal }).catch(() => {
      // The socket route will respond immediately once the server is ready.
    })

    const socket = getRealtimeClient()

    if (!socket) {
      controller.abort()
      return
    }

    const gate = createRefreshGate()

    const refresh = () => {
      // On the 404 page Next turns router.refresh() into a full reload (#118).
      if (document.querySelector(`[${NOT_FOUND_MARKER_ATTRIBUTE}]`)) {
        return
      }

      router.refresh()
    }

    const handleDisconnect = () => {
      gate.onDisconnect()
    }

    const handleConnect = () => {
      if (gate.onConnect(Date.now())) {
        refresh()
      }
    }

    const handleEvent = (payload: unknown) => {
      if (gate.onEvent(payload, Date.now())) {
        refresh()
      }
    }

    socket.on("disconnect", handleDisconnect)
    socket.on("connect", handleConnect)
    socket.on("realtime:event", handleEvent)

    return () => {
      controller.abort()
      socket.off("disconnect", handleDisconnect)
      socket.off("connect", handleConnect)
      socket.off("realtime:event", handleEvent)
    }
  }, [router])

  return <>{children}</>
}
