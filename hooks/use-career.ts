"use client"

import useSWR from "swr"
import type { Career } from "@/types/database"

const fetcher = async (url: string) => {
    const res = await fetch(url)
    if (!res.ok) {
        throw new Error("Failed to fetch career entries")
    }
    return res.json()
}

interface CareerResponse {
    careers: Career[]
}

export function useCareer() {
    const { data, error, isLoading, mutate } = useSWR<CareerResponse>("/api/career", fetcher)

    return {
        careers: data?.careers || [],
        isLoading,
        isError: error,
        mutate,
    }
}

