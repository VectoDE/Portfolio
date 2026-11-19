import { Suspense } from "react"

import { getAllSkills } from "@/lib/skills"
import { SkillsShowcaseSkeleton } from "@/components/skeletons/skills-showcase-skeleton"
import type { Skill } from "@/types/database"

// Display order of categories; anything else follows alphabetically.
const categoryOrder = [
  "Languages",
  "Frontend",
  "Backend & APIs",
  "Databases",
  "Cloud & Hosting",
  "DevOps & CI/CD",
  "Testing",
  "Mobile & Desktop",
  "AI & Automation",
  "Bots & Integrations",
]

function groupByCategory(skills: Skill[]) {
  const groups = new Map<string, Skill[]>()
  for (const skill of skills) {
    groups.set(skill.category, [...(groups.get(skill.category) ?? []), skill])
  }
  const rank = (category: string) => {
    const index = categoryOrder.indexOf(category)
    return index === -1 ? categoryOrder.length : index
  }
  return [...groups.entries()].sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b))
}

async function SkillsContent({ levels }: Readonly<{ levels?: string[] }>) {
  const allSkills = await getAllSkills()
  const skills = levels ? allSkills.filter((skill) => levels.includes(skill.level)) : allSkills

  if (skills.length === 0) {
    return <p className="text-muted-foreground">No technologies listed yet.</p>
  }

  return (
    <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
      {groupByCategory(skills).map(([category, items]) => (
        <section key={category} aria-label={category}>
          <h3 className="border-b pb-2 text-sm font-semibold">{category}</h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {items.map((skill) => (
              <li
                key={skill.id}
                className={
                  skill.level === "Core"
                    ? "rounded-md border border-primary px-2.5 py-1 text-sm font-medium"
                    : "rounded-md border px-2.5 py-1 text-sm"
                }
              >
                {skill.name}
                {skill.level === "Core" && !levels ? (
                  <span className="sr-only"> (core)</span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

export function SkillsShowcase({ levels }: Readonly<{ levels?: string[] }>) {
  return (
    <Suspense fallback={<SkillsShowcaseSkeleton />}>
      <SkillsContent levels={levels} />
    </Suspense>
  )
}
