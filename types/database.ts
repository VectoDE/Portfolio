export interface User {
  id: string
  email: string
  name: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Project {
  id: string
  title: string
  description: string
  technologies: string
  link: string | null
  imageUrl: string | null
  githubUrl: string | null
  featured: boolean
  createdAt: Date
  updatedAt: Date
  userId: string
}

export interface Certificate {
  id: string
  name: string
  issuer: string
  date: Date
  link: string | null
  imageUrl: string | null
  createdAt: Date
  updatedAt: Date
  userId: string
}

export interface Skill {
  id: string
  name: string
  category: string
  level: string
  years: number
  iconName: string | null
  createdAt: Date
  updatedAt: Date
  userId: string
}

export interface Career {
  id: string
  position: string
  company: string
  startDate: Date
  endDate: string | Date | "Present"
  description: string
  logoUrl: string | null
  location: string | null
  createdAt: Date
  updatedAt: Date
  userId: string
}

export interface Contact {
  id: string
  name: string
  email: string
  subject?: string | null
  message: string
  status: "unread" | "read" | "replied" | "archived"
  notes?: string | null
  createdAt: string
  updatedAt: string
}

// Type for 30-day change statistics
export interface StatsWithChange {
  count: number
  change: number
  percentage: number
}

