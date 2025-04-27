"use client"

import { useEffect } from "react"

export const Logger = () => {
    useEffect(() => {
        const sendLog = async (level: "info" | "error" | "debug", message: string) => {
            try {
                await fetch("/api/logger", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ level, message }),
                })
            } catch (err) {
                console.error("Failed to send log:", err)
            }
        }

        sendLog("info", "Page loaded")

        sendLog("debug", `User agent: ${navigator.userAgent}`)

        window.addEventListener("error", (e) => {
            sendLog("error", `Global error: ${e.message}`)
        })

        window.addEventListener("unhandledrejection", (e) => {
            sendLog("error", `Unhandled promise rejection: ${e.reason}`)
        })
    }, [])

    return null
}
