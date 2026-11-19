// Captures every public page per viewport and theme.
// Usage: BASE_URL=http://localhost:3000 OUT_DIR=shots node screenshots.mjs
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"

import { chromium } from "playwright"

import { evaluateStable, initScript, pages, settle, themes, viewports } from "./pages.mjs"

const baseUrl = process.env.BASE_URL ?? "http://localhost:3000"
const outDir = process.env.OUT_DIR ?? "shots"

await mkdir(outDir, { recursive: true })
const browser = await chromium.launch()
const report = []

try {
  for (const viewport of viewports) {
    for (const theme of themes) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 1,
        colorScheme: theme,
        reducedMotion: "reduce",
      })
      await context.addInitScript(initScript(theme))
      for (const entry of pages) {
        const page = await context.newPage()
        const file = `${entry.name}-${viewport.name}-${theme}.png`
        const response = await page.goto(baseUrl + entry.path, { waitUntil: "load", timeout: 60_000 })
        await settle(page)
        const overflow = await evaluateStable(
          page,
          () => document.documentElement.scrollWidth - window.innerWidth,
          entry.path,
        )
        await page.screenshot({ path: path.join(outDir, file), fullPage: true, animations: "disabled" })
        report.push({
          page: entry.name,
          viewport: viewport.name,
          theme,
          status: response?.status() ?? null,
          finalUrl: page.url(),
          horizontalOverflowPx: overflow,
          file,
        })
        await page.close()
      }
      await context.close()
    }
  }

  // First visit with the cookie banner, as a new visitor sees it.
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      colorScheme: "light",
      reducedMotion: "reduce",
    })
    const page = await context.newPage()
    await page.goto(baseUrl + "/", { waitUntil: "load" })
    await page.waitForTimeout(1500)
    await page.screenshot({
      path: path.join(outDir, `home-first-visit-${viewport.name}-light.png`),
      animations: "disabled",
    })
    await context.close()
  }
} finally {
  await browser.close()
}

await writeFile(path.join(outDir, "report.json"), JSON.stringify(report, null, 2))
console.table(report.map(({ file, status, horizontalOverflowPx }) => ({ file, status, horizontalOverflowPx })))
