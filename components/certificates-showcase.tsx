import { Suspense, cache } from "react"
import Link from "next/link"
import { ExternalLink, GraduationCap } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getAllCertificates } from "@/lib/certificates"
import { CertificatesShowcaseSkeleton } from "@/components/skeletons/certificates-showcase-skeleton"
import type { Certificate } from "@/types/database"

const getCachedCertificates = cache(getAllCertificates)

async function CertificatesShowcaseContent() {
  const certificates = await getCachedCertificates(3)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {certificates.map((certificate: Certificate) => (
        <Card
          key={certificate.id}
          className="overflow-hidden group bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <div className="aspect-video relative bg-muted overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <GraduationCap className="h-16 w-16 text-primary/30" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
              {certificate.link && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/20 backdrop-blur-md text-white border-none"
                >
                  <ExternalLink className="h-4 w-4 mr-1" /> View Certificate
                </Button>
              )}
            </div>
          </div>
          <CardHeader>
            <CardTitle className="text-xl">{certificate.name}</CardTitle>
            <CardDescription>{certificate.issuer}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Issued:{" "}
              {new Date(certificate.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
              })}
            </p>
          </CardContent>
          <CardFooter>
            {certificate.link ? (
              <Link
                href={certificate.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button variant="outline" size="sm" className="w-full">
                  View Certificate
                </Button>
              </Link>
            ) : (
              <Button variant="outline" size="sm" className="w-full" disabled>
                Certificate Not Available Online
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

export function CertificatesShowcase() {
  return (
    <Suspense fallback={<CertificatesShowcaseSkeleton />}>
      <CertificatesShowcaseContent />
    </Suspense>
  )
}
