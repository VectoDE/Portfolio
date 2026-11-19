// Runs axe-core (WCAG 2.2 A/AA) and a keyboard focus check on every public page.
// Fails when axe reports an A/AA violation or a focusable element shows no focus indicator.
// AAA rules (for example color-contrast-enhanced) are reported but do not fail the run.
// Usage: BASE_URL=http://localhost:3000 OUT_DIR=a11y node a11y.mjs
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"

import AxeBuilder from "@axe-core/playwright"
import { chromium } from "playwright"

import { initScript, pages, settle, themes, viewports } from "./pages.mjs"

const baseUrl = process.env.BASE_URL ?? "http://localhost:3000"
const outDir = process.env.OUT_DIR ?? "a11y"
const failTags = new Set(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])

await mkdir(outDir, { recursive: true })
const browser = await chromium.launch()
const results = []
let failures = 0

async function checkKeyboard(page) {
  const problems = []
  for (let i = 0; i < 40; i += 1) {
    await page.keyboard.press("Tab")
    const info = await page.evaluate(() => {
      const el = document.activeElement
      if (!el || el === document.body) return null
      const style = getComputedStyle(el)
      const outline = style.outlineStyle !== "none" && Number.parseFloat(style.outlineWidth) > 0
      const ring = Boolean(style.boxShadow) && style.boxShadow !== "none"
      const label = (el.getAttribute("aria-label") || el.textContent || el.getAttribute("href") || el.tagName)
        .trim()
        .slice(0, 60)
      return { label, tag: el.tagName, visible: outline || ring }
    })
    if (!info) break
    if (!info.visible) problems.push(info)
  }
  return problems
}

try {
  for (const viewport of viewports) {
    for (const theme of themes) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        colorScheme: theme,
        reducedMotion: "reduce",
      })
      await context.addInitScript(initScript(theme))
      for (const entry of pages) {
        const page = await context.newPage()
        await page.goto(baseUrl + entry.path, { waitUntil: "load", timeout: 60_000 })
        await settle(page)
        const axe = await new AxeBuilder({ page }).withTags([...failTags, "wcag2aaa", "wcag21aaa"]).analyze()
        const blocking = axe.violations.filter((v) => v.tags.some((tag) => failTags.has(tag)))
        const aaa = axe.violations.filter((v) => !blocking.includes(v))
        const focus = viewport.name === "desktop" ? await checkKeyboard(page) : []
        failures += blocking.length + focus.length
        results.push({
          page: entry.name,
          viewport: viewport.name,
          theme,
          violations: blocking.map((v) => ({
            id: v.id,
            impact: v.impact,
            nodes: v.nodes.length,
            targets: v.nodes.slice(0, 5).map((n) => n.target.join(" ")),
          })),
          aaa: aaa.map((v) => ({ id: v.id, nodes: v.nodes.length })),
          focusWithoutIndicator: focus,
        })
        await page.close()
      }
      await context.close()
    }
  }
} finally {
  await browser.close()
}

await writeFile(path.join(outDir, "a11y-report.json"), JSON.stringify(results, null, 2))

const lines = [
  "| Page | Viewport | Theme | WCAG A/AA | AAA (info) | Focus issues |",
  "|---|---|---|---|---|---|",
]
for (const r of results) {
  const v = r.violations.map((x) => `${x.id} (${x.nodes})`).join(", ") || "0"
  const a = r.aaa.map((x) => `${x.id} (${x.nodes})`).join(", ") || "0"
  lines.push(`| ${r.page} | ${r.viewport} | ${r.theme} | ${v} | ${a} | ${r.focusWithoutIndicator.length} |`)
}
await writeFile(path.join(outDir, "summary.md"), lines.join("\n") + "\n")
console.log(lines.join("\n"))

if (failures > 0) {
  console.error(`${failures} accessibility problem(s) found`)
  process.exitCode = 1
}
