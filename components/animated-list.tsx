import type { ReactNode } from "react"

interface AnimatedListProps {
  children: ReactNode
  className?: string
  /** Kept for call-site compatibility; lists no longer animate. */
  initialDelay?: number
  stagger?: number
}

export function AnimatedList({ children, className }: Readonly<AnimatedListProps>) {
  return <div className={className}>{children}</div>
}
