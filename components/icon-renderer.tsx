"use client"

import { useState, useEffect } from "react"
import * as LucideIcons from "lucide-react"

interface IconRendererProps {
    iconName: string
    className?: string
}

export function IconRenderer({ iconName, className = "h-6 w-6" }: IconRendererProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <div className={`animate-pulse bg-muted rounded-sm ${className}`} />
    }

    const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons] as React.ComponentType<{
        className?: string
    }> | undefined

    if (!IconComponent) {
        return <div className={`bg-muted rounded-sm ${className}`} />
    }

    return <IconComponent className={className} />
}
