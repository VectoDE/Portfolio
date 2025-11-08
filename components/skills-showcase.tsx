import type React from "react"
import { Suspense } from "react"
import { Code2, Database, Server, Globe, Cpu, Layers } from "lucide-react"
import * as LucideIcons from "lucide-react"
import { getAllSkills } from "@/lib/skills"
import { SkillsShowcaseSkeleton } from "@/components/skeletons/skills-showcase-skeleton"

// Add proper type for skills
import type { Skill } from "@/types/database"

// Create a type for the Lucide icons
type LucideIconType = React.ComponentType<React.SVGProps<SVGSVGElement>>

// Default skill icons by category
const categoryIcons: Record<string, LucideIconType> = {
  Frontend: Globe,
  Backend: Server,
  Database: Database,
  DevOps: Cpu,
  Language: Code2,
  Other: Layers,
}

async function SkillsContent() {
  const skills = await getAllSkills()

  // Group skills by category
  const groupedSkills: Record<string, Skill[]> = {}

  skills.forEach((skill) => {
    if (!groupedSkills[skill.category]) {
      groupedSkills[skill.category] = []
    }
    groupedSkills[skill.category].push(skill)
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Object.entries(groupedSkills).map(([category, skills]) => {
        // Get the icon for this category or use a default
        const CategoryIcon = categoryIcons[category] || Layers

        return (
          <div
            key={category}
            className="flex flex-col items-center gap-4 p-6 bg-background/60 backdrop-blur-sm rounded-xl border border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CategoryIcon className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">{category}</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {skills.map((skill) => {
                // Try to get the custom icon if specified
                let SkillIconComponent: LucideIconType = Layers

                if (skill.iconName && typeof skill.iconName === "string") {
                  const iconKey = skill.iconName as keyof typeof LucideIcons
                  if (LucideIcons[iconKey] && typeof LucideIcons[iconKey] === "function") {
                    SkillIconComponent = LucideIcons[iconKey] as LucideIconType
                  }
                }

                return (
                  <div
                    key={skill.id}
                    className="flex items-center gap-1 rounded-full bg-background px-3 py-1 text-sm border border-primary/20"
                    title={`${skill.level} - ${skill.years} years`}
                  >
                    {SkillIconComponent && (
                      <SkillIconComponent className="h-3.5 w-3.5 mr-1 text-primary" />
                    )}
                    <span>{skill.name}</span>
                    <span className="inline-flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs w-5 h-5">
                      {skill.level.charAt(0)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function SkillsShowcase() {
  return (
    <Suspense fallback={<SkillsShowcaseSkeleton />}>
      <SkillsContent />
    </Suspense>
  )
}
