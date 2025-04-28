import { NextResponse } from "next/server";
import logger from "@/lib/logger";

export async function POST(req: Request) {
    try {
        const { level, message } = await req.json();

        if (!level || !message) {
            return NextResponse.json({ message: "Missing level or message" }, { status: 400 });
        }

        if (["error", "info", "debug"].includes(level)) {
            (logger as any)[level](message);
            logger.info(`Client log (${level}): ${message}`);
        } else {
            logger.info(`Client log (unknown level): ${message}`);
        }

        return NextResponse.json({ message: "Log recorded" }, { status: 200 });
    } catch (error) {
        console.error("Logger API error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
