import otherRoles from "@/content/other-roles.json"

type OtherRole = {
  id: string
  position: string
  company: string
  location?: string
  period: string
  description: string
}

const roles: OtherRole[] = otherRoles

/**
 * Jobs and internships outside IT. Kept in content/other-roles.json rather than the database,
 * so they sit below the IT career and never mix with it.
 */
export function OtherRoles() {
  return (
    <ul className="grid max-w-3xl gap-6 sm:grid-cols-2">
      {roles.map((role) => (
        <li key={role.id}>
          <p className="text-sm text-muted-foreground">{role.period}</p>
          <h4 className="mt-1 font-semibold">{role.position}</h4>
          <p className="text-sm text-muted-foreground">
            {role.company}
            {role.location ? `, ${role.location}` : null}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{role.description}</p>
        </li>
      ))}
    </ul>
  )
}
