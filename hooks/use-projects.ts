"use client"

import useSWR from "swr"

// Add proper return type for the hook
import type { Project } from "@/types/database"

interface ProjectsResponse {
  projects: Project[]
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error("Failed to fetch projects")
  }
  return res.json()
}

export function useProjects() {
  const { data, error, isLoading, mutate } = useSWR<ProjectsResponse>("/api/projects", fetcher)

  return {
    projects: data?.projects || [],
    isLoading,
    isError: error,
    mutate,
  }
}
