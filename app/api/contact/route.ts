import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json()

    // Validate input
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // In a real application, you would send an email or store the message in a database
    console.log("Contact form submission:", { name, email, message })

    // For demonstration purposes, we'll just return a success response
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error in contact route:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
