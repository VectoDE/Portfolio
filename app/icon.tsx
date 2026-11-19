import { ImageResponse } from "next/og"

import { monogram } from "@/lib/monogram"

export const size = { width: 64, height: 64 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(monogram(size.width), size)
}
