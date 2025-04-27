import type { NextApiRequest, NextApiResponse } from "next"
import logger from "@/lib/logger"

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" })
    }

    const { level, message } = req.body

    if (!level || !message) {
        return res.status(400).json({ message: "Missing level or message" })
    }

    if (["error", "info", "debug"].includes(level)) {
        (logger as any)[level](message)
        logger.info(`Client log (${level}): ${message}`)
    } else {
        logger.info(`Client log (unknown level): ${message}`)
    }

    res.status(200).json({ message: "Log recorded" })
}
