// Fields that the API may return for each model. Owner references (userId) and relations
// stay out on purpose, so a public endpoint never reveals account identifiers.
// Keep this module free of runtime imports: the unit tests load it without dependencies.
// The Prisma namespace types are not available here (types/prisma.d.ts shims @prisma/client),
// so the shape is checked as a plain select map. The unit test guards against leaking fields.

type SelectMap = Readonly<Record<string, true>>

export const careerPublicSelect = {
  id: true,
  position: true,
  company: true,
  startDate: true,
  endDate: true,
  description: true,
  logoUrl: true,
  location: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies SelectMap

export const certificatePublicSelect = {
  id: true,
  name: true,
  issuer: true,
  date: true,
  link: true,
  imageUrl: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies SelectMap

export const skillPublicSelect = {
  id: true,
  name: true,
  category: true,
  level: true,
  years: true,
  iconName: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies SelectMap
