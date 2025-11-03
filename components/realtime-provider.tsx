"use client"

import type { ReactNode } from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getRealtimeClient } from "@/lib/realtime-client"

interface RealtimeProviderProps {
  children: ReactNode
}

export function RealtimeProvider({ children }: RealtimeProviderProps) {
  const router = useRouter()

  useEffect(() => {
    const controller = new AbortController()

    fetch("/api/socket/io", { signal: controller.signal }).catch(() => {
      // The socket route will respond immediately once the server is ready.
    })

    const socket = getRealtimeClient()

    if (!socket) {
      controller.abort()
      return
    }

    const handleEvent = () => {
      router.refresh()
    }

    const handleConnect = () => {
      router.refresh()
    }

    socket.on("connect", handleConnect)

    socket.on("realtime:event", handleEvent)

    return () => {
      controller.abort()
      socket.off("realtime:event", handleEvent)
      socket.off("connect", handleConnect)
    }
  }, [router])

  return <>{children}</>
}

