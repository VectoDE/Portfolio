import { readFile } from "node:fs/promises"
import path from "node:path"

import { ImageResponse } from "next/og"

import { profile } from "@/lib/content"

export const alt = `${profile.name}, ${profile.jobTitle} and ${profile.role}`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

// Social preview: name and role on the left, the 1:1 portrait flush right.
export default async function OpenGraphImage() {
  const photo = await readFile(path.join(process.cwd(), "public/images/tim-hauke/square-630.jpg"))
  const photoSrc = `data:image/jpeg;base64,${photo.toString("base64")}`

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#fafaf9",
          color: "#18181b",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: 570,
            padding: "0 64px",
          }}
        >
          <div style={{ width: 56, height: 6, backgroundColor: "#6d28d9", marginBottom: 32 }} />
          <div style={{ fontSize: 76, lineHeight: 1.05, letterSpacing: -2 }}>{profile.name}</div>
          <div style={{ fontSize: 34, lineHeight: 1.3, marginTop: 20, color: "#3f3f46" }}>{profile.jobTitle}</div>
          <div style={{ fontSize: 34, lineHeight: 1.3, color: "#3f3f46" }}>{profile.role}</div>
          <div style={{ fontSize: 24, marginTop: 40, color: "#52525b" }}>{profile.location}</div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain img only */}
        <img src={photoSrc} width={630} height={630} alt="" style={{ objectFit: "cover" }} />
      </div>
    ),
    size,
  )
}
