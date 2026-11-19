import { Suspense } from "react"
import { ExternalLink } from "lucide-react"

import { getAllCertificates } from "@/lib/certificates"
import { CertificatesShowcaseSkeleton } from "@/components/skeletons/certificates-showcase-skeleton"
import type { Certificate } from "@/types/database"

const issued = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" })

function CertificateItem({
  certificate,
  compact,
}: Readonly<{ certificate: Certificate; compact: boolean }>) {
  return (
    <li
      className={
        compact
          ? "flex flex-col rounded-lg border bg-card p-5"
          : "flex flex-col gap-1 border-t py-4 sm:flex-row sm:items-baseline sm:gap-6"
      }
    >
      <time
        dateTime={new Date(certificate.date).toISOString().slice(0, 7)}
        className="shrink-0 text-sm text-muted-foreground sm:w-36"
      >
        {issued.format(new Date(certificate.date))}
      </time>
      <div className={compact ? "mt-2 flex-1" : "flex-1"}>
        <p className="font-medium leading-snug">{certificate.name}</p>
        <p className="text-sm text-muted-foreground">{certificate.issuer}</p>
      </div>
      {certificate.link ? (
        <a
          href={certificate.link}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline ${compact ? "mt-4" : ""}`}
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          Proof<span className="sr-only">: {certificate.name} (opens in a new tab)</span>
        </a>
      ) : null}
    </li>
  )
}

async function CertificatesShowcaseContent({ limit }: Readonly<{ limit?: number }>) {
  const certificates = await getAllCertificates(limit)

  if (certificates.length === 0) {
    return <p className="text-muted-foreground">No certificates listed yet.</p>
  }

  const compact = Boolean(limit)
  return (
    <ul className={compact ? "grid grid-cols-1 gap-6 md:grid-cols-3" : "border-b"}>
      {certificates.map((certificate) => (
        <CertificateItem key={certificate.id} certificate={certificate} compact={compact} />
      ))}
    </ul>
  )
}

/** Latest certificates as cards (default 3) or, with `limit={0}`, the full list. */
export function CertificatesShowcase({ limit = 3 }: Readonly<{ limit?: number }>) {
  return (
    <Suspense fallback={<CertificatesShowcaseSkeleton />}>
      <CertificatesShowcaseContent limit={limit || undefined} />
    </Suspense>
  )
}
