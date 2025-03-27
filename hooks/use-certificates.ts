"use client"

import useSWR from "swr"
import type { Certificate } from "@/types/database"

interface CertificatesResponse {
    certificates: Certificate[]
}

const fetcher = async (url: string) => {
    const res = await fetch(url)
    if (!res.ok) {
        throw new Error("Failed to fetch certificates")
    }
    return res.json()
}

export function useCertificates() {
    const { data, error, isLoading, mutate } = useSWR<CertificatesResponse>("/api/certificates", fetcher)

    return {
        certificates: data?.certificates || [],
        isLoading,
        isError: error,
        mutate,
    }
}

