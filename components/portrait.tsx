import Image from "next/image"

import { cn } from "@/lib/utils"

type PortraitVariant = "portrait" | "square"

const sources: Record<PortraitVariant, { widths: number[]; ratio: number; fallback: string; fallbackWidth: number }> = {
  // 4:5 crop, head and shoulders
  portrait: { widths: [480, 800, 1024], ratio: 5 / 4, fallback: "portrait-800.jpg", fallbackWidth: 800 },
  // 1:1 crop, head and collar
  square: { widths: [256, 512, 1024], ratio: 1, fallback: "square-630.jpg", fallbackWidth: 630 },
}

const basePath = "/images/tim-hauke"

function srcSet(variant: PortraitVariant, format: "avif" | "webp") {
  return sources[variant].widths.map((width) => `${basePath}/${variant}-${width}.${format} ${width}w`).join(", ")
}

interface PortraitProps {
  variant?: PortraitVariant
  /** Rendered width in CSS pixels for the browser's source selection, e.g. "(min-width: 1024px) 400px, 80vw". */
  sizes: string
  priority?: boolean
  className?: string
}

/**
 * Photo of Tim Hauke. Images are pre-cropped and pre-encoded (AVIF, WebP, JPEG fallback)
 * because the Next.js image optimizer is disabled in next.config.mjs. EXIF data is stripped.
 */
export function Portrait({ variant = "portrait", sizes, priority = false, className }: Readonly<PortraitProps>) {
  const source = sources[variant]
  const height = Math.round(source.fallbackWidth * source.ratio)

  return (
    <picture className={cn("block overflow-hidden", className)}>
      <source type="image/avif" srcSet={srcSet(variant, "avif")} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(variant, "webp")} sizes={sizes} />
      <Image
        src={`${basePath}/${source.fallback}`}
        alt="Tim Hauke"
        width={source.fallbackWidth}
        height={height}
        sizes={sizes}
        priority={priority}
        className="h-full w-full object-cover"
      />
    </picture>
  )
}
