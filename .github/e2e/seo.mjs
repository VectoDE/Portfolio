// Checks meta tags, structured data and crawler files on the running site.
// Usage: BASE_URL=http://localhost:3000 OUT_DIR=seo node seo.mjs
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"

const baseUrl = process.env.BASE_URL ?? "http://localhost:3000"
const outDir = process.env.OUT_DIR ?? "seo"

const indexable = [
  "/",
  "/about",
  "/projects",
  "/projects/tellersonne",
  "/contact",
  "/newsletter",
  "/privacy",
  "/impressum",
]
const noindex = ["/login", "/register", "/unsubscribe"]

await mkdir(outDir, { recursive: true })

const problems = []
const rows = []

function meta(html, attr, name) {
  const pattern = new RegExp(`<meta[^>]+${attr}="${name}"[^>]*content="([^"]*)"`, "i")
  return html.match(pattern)?.[1] ?? null
}

for (const route of [...indexable, ...noindex]) {
  const response = await fetch(baseUrl + route)
  const html = await response.text()
  const title = html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? null
  const description = meta(html, "name", "description")
  const canonical = html.match(/<link[^>]+rel="canonical"[^>]*href="([^"]*)"/i)?.[1] ?? null
  const ogTitle = meta(html, "property", "og:title")
  const ogImage = meta(html, "property", "og:image")
  const twitterCard = meta(html, "name", "twitter:card")
  const robots = meta(html, "name", "robots")
  const jsonLd = [
    ...html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi),
  ].map((m) => m[1])
  const hasPerson = jsonLd.some((block) => block.includes('"Person"'))

  const issues = []
  if (response.status !== 200) issues.push(`status ${response.status}`)
  if (!title) issues.push("no title")
  if (title && /\|.*\|.*\|/.test(title)) issues.push("site name repeated in title")
  if (!description) issues.push("no description")
  if (description && (description.length < 50 || description.length > 170))
    issues.push(`description length ${description.length}`)
  if (!canonical) issues.push("no canonical")
  if (!ogTitle) issues.push("no og:title")
  if (!ogImage) issues.push("no og:image")
  if (twitterCard !== "summary_large_image") issues.push("no twitter card")
  if (!hasPerson) issues.push("no Person JSON-LD")
  const isNoindex = Boolean(robots && /noindex/i.test(robots))
  if (noindex.includes(route) && !isNoindex) issues.push("should be noindex")
  if (indexable.includes(route) && isNoindex) issues.push("unexpected noindex")

  problems.push(...issues.map((issue) => `${route}: ${issue}`))
  rows.push({
    route,
    title,
    descriptionLength: description?.length ?? 0,
    canonical,
    ogImage,
    issues,
  })
}

for (const file of [
  "/robots.txt",
  "/sitemap.xml",
  "/llms.txt",
  "/opengraph-image",
  "/icon",
  "/manifest.webmanifest",
]) {
  const response = await fetch(baseUrl + file)
  const body = Buffer.from(await response.arrayBuffer())
  if (response.status !== 200 || body.length === 0)
    problems.push(`${file}: status ${response.status}, ${body.length} bytes`)
  if (file === "/opengraph-image") await writeFile(path.join(outDir, "opengraph-image.png"), body)
  rows.push({ route: file, status: response.status, bytes: body.length })
}

await writeFile(path.join(outDir, "seo-report.json"), JSON.stringify(rows, null, 2))
console.table(
  rows.map(({ route, title, issues, status }) => ({
    route,
    title,
    status,
    issues: issues?.join("; "),
  })),
)

if (problems.length > 0) {
  console.error(problems.join("\n"))
  process.exitCode = 1
}
