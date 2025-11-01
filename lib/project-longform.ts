import prisma from "./db"

const PROJECT_LONGFORM_COLUMNS = [
  "developmentProcess",
  "challengesFaced",
  "futurePlans",
  "logContent",
] as const

type ProjectLongFormColumn = (typeof PROJECT_LONGFORM_COLUMNS)[number]

let ensured = false
let ensurePromise: Promise<void> | null = null

function isMySqlDatabase(): boolean {
  const url = process.env.DATABASE_URL ?? ""
  return url.startsWith("mysql://") || url.startsWith("mysqls://")
}

async function fetchProjectColumnTypes() {
  const result = await prisma.$queryRawUnsafe(
    `SHOW COLUMNS FROM \`Project\` WHERE Field IN (${PROJECT_LONGFORM_COLUMNS.map((column) => `'${column}'`).join(",")})`,
  )

  return result as Array<{ Field: string; Type: string }>
}

function needsAlteration(columns: Array<{ Field: string; Type: string }>): boolean {
  const columnTypeMap = new Map<ProjectLongFormColumn, string>()

  for (const column of columns) {
    const field = column.Field as ProjectLongFormColumn
    if (PROJECT_LONGFORM_COLUMNS.includes(field)) {
      columnTypeMap.set(field, column.Type.toLowerCase())
    }
  }

  return PROJECT_LONGFORM_COLUMNS.some((column) => columnTypeMap.get(column) !== "longtext")
}

async function applyAlterations() {
  const clauses = PROJECT_LONGFORM_COLUMNS.map((column) => `MODIFY \`${column}\` LONGTEXT NULL`).join(",\n  ")
  await prisma.$executeRawUnsafe(`ALTER TABLE \`Project\`\n  ${clauses};`)
}

export async function ensureProjectLongFormColumns() {
  if (ensured) {
    return
  }

  if (!isMySqlDatabase()) {
    ensured = true
    return
  }

  if (!ensurePromise) {
    ensurePromise = (async () => {
      try {
        const columns = await fetchProjectColumnTypes()
        if (!Array.isArray(columns) || needsAlteration(columns)) {
          await applyAlterations()
        }
        ensured = true
        ensurePromise = null
      } catch (error) {
        console.error("Failed to ensure long-form project columns:", error)
        ensurePromise = null
        throw error
      }
    })()
  }

  try {
    await ensurePromise
  } catch (error) {
    throw new Error(
      "Failed to prepare the database for long-form project content. Please check database permissions and connectivity.",
      { cause: error },
    )
  }
}
