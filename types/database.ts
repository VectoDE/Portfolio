// Update this file to include proper type definitions

export interface User {
  id: string
  email: string
  password: string
  name: string | null
  username: string | null
  imageUrl: string | null
  role: string | null
  createdAt: Date
  updatedAt: Date
  comments?: ProjectComment[]
  reactions?: ProjectReaction[]
}

export interface Project {
  id: string
  title: string
  description: string
  technologies: string
  link: string | null
  imageUrl: string | null
  logoUrl: string | null
  githubUrl: string | null
  featured: boolean
  developmentProcess: string | null
  challengesFaced: string | null
  futurePlans: string | null
  logContent: string | null
  createdAt: Date | string
  updatedAt: Date | string
  userId: string
  user?: Pick<User, "id" | "name" | "email">
  features?: ProjectFeature[]
  comments?: ProjectComment[]
  reactions?: ProjectReaction[]
}

export interface ProjectFeature {
  id: string
  name: string
  description: string | null
  projectId: string
  createdAt: Date | string
  updatedAt: Date | string
}

export interface Certificate {
  id: string
  name: string
  issuer: string
  date: Date | string
  link: string | null
  imageUrl: string | null
  createdAt: Date | string
  updatedAt: Date | string
  userId: string
}

export interface Skill {
  id: string
  name: string
  category: string
  level: string
  years: number
  iconName: string | null
  createdAt: Date | string
  updatedAt: Date | string
  userId: string
}

export interface Career {
  id: string
  position: string
  company: string
  startDate: Date | string
  endDate: string | Date | "Present"
  description: string
  logoUrl: string | null
  location: string | null
  createdAt: Date | string
  updatedAt: Date | string
  userId: string
}

export interface Contact {
  id: string
  name: string
  email: string
  subject: string | null
  message: string
  status: "unread" | "read" | "replied" | "archived"
  notes: string | null
  createdAt: Date | string
  updatedAt: Date | string
}

export interface PageView {
  id: string
  path: string
  ipAddress: string | null
  userAgent: string | null
  referrer: string | null
  createdAt: Date | string
}

export interface Analytics {
  id: string
  type: string
  date: Date | string
  views: number
  visitors: number
  createdAt: Date | string
  updatedAt: Date | string
}

// Type for 30-day change statistics
export interface StatsWithChange {
  count: number
  change: number
  percentage: number
}

// Add EmailSettings interface to the types
export interface EmailSettings {
  id: string
  adminEmail: string | null
  emailFrom: string | null
  smtpServer: string | null
  smtpPort: string | null
  smtpUser: string | null
  smtpPassword: string | null
  sendAutoReply: boolean
  createdAt: Date | string
  updatedAt: Date | string
}

// New types for newsletter functionality
export interface Subscriber {
  id: string
  email: string
  name: string | null
  token: string
  isConfirmed: boolean
  createdAt: Date | string
  updatedAt: Date | string
  preferences?: SubscriberPreference
}

export interface SubscriberPreference {
  id: string
  subscriberId: string
  projects: boolean
  certificates: boolean
  skills: boolean
  careers: boolean
  createdAt: Date | string
  updatedAt: Date | string
}

export interface Newsletter {
  id: string
  subject: string
  content: string
  sentAt: Date | string | null
  scheduledFor: Date | string | null
  status: "draft" | "scheduled" | "sent" | "cancelled"
  type: "project" | "certificate" | "skill" | "career" | "manual"
  projectId: string | null
  createdAt: Date | string
  updatedAt: Date | string
  project?: Project
}

export interface AnnouncementSettings {
  id: string
  userId: string
  newProjects: boolean
  newCertificates: boolean
  newSkills: boolean
  newCareers: boolean
  createdAt: Date | string
  updatedAt: Date | string
}

export interface Media {
  id: string
  userId: string
  originalName: string
  fileName: string
  mimeType: string | null
  size: number
  url: string
  createdAt: Date | string
}

export type ReactionType = "LIKE" | "INSIGHTFUL" | "CELEBRATE"

export interface ProjectComment {
  id: string
  projectId: string
  userId: string
  content: string
  createdAt: Date | string
  updatedAt: Date | string
  user?: Pick<User, "id" | "name" | "imageUrl">
}

export interface ProjectReaction {
  id: string
  projectId: string
  userId: string
  type: ReactionType
  createdAt: Date | string
}

export interface ReactionSummary {
  counts: Record<ReactionType, number>
  total: number
  userReaction: ReactionType | null
}

export interface EngagementHighlightProject {
  id: string
  title: string
  description: string
  commentCount: number
  reactionCount: number
  updatedAt: string
}

export interface LatestCommunityComment {
  id: string
  projectId: string
  projectTitle: string
  content: string
  createdAt: string
  authorName: string | null
}

export interface EngagementHighlights {
  totalComments: number
  totalReactions: number
  memberCount: number
  topProjects: EngagementHighlightProject[]
  latestComment?: LatestCommunityComment | null
}
