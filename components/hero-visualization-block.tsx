"use client"

import dynamic from "next/dynamic"

const LazyHeroVisualization = dynamic(
  () => import("./hero-visualization").then((mod) => mod.HeroVisualization),
  {
    ssr: false,
    loading: () => (
      <div className="h-[360px] w-full rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-950 animate-pulse" />
    ),
  },
)

export function HeroVisualizationBlock() {
  return <LazyHeroVisualization />
}
