"use client"

import useSWR from "swr"
import type { Skill } from "@/types/database"

const fetcher = async (url: string) => {
    const res = await fetch(url)
    if (!res.ok) {
        throw new Error("Failed to fetch skills")
    }
    return res.json()
}

interface SkillsResponse {
    skills: Skill[]
}

export function useSkills() {
    const { data, error, isLoading, mutate } = useSWR<SkillsResponse>("/api/skills", fetcher)

    return {
        skills: data?.skills || [],
        isLoading,
        isError: error,
        mutate,
    }
}

