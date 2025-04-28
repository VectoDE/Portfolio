"use client";

import { useEffect } from "react";

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
                });
            } catch (err) {
                console.error("Failed to send log:", err);
            }
        };

        // Log basic info when page loads
        sendLog("info", "Page loaded");

        // Log user agent (debug info)
        sendLog("debug", `User agent: ${navigator.userAgent}`);

        // Capture global JS errors
        const handleError = (event: ErrorEvent) => {
            sendLog("error", `Global error: ${event.message}`);
        };

        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            sendLog("error", `Unhandled promise rejection: ${event.reason}`);
        };

        window.addEventListener("error", handleError);
        window.addEventListener("unhandledrejection", handleUnhandledRejection);

        return () => {
            // Cleanup listeners on unmount
            window.removeEventListener("error", handleError);
            window.removeEventListener("unhandledrejection", handleUnhandledRejection);
        };
    }, []);

    return null;
};
