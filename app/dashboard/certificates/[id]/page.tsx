import EditCertificatePageClient from "./client-page"

interface EditCertificatePageProps {
  params: Promise<{ id?: string }>
}

export default async function EditCertificatePage({ params }: EditCertificatePageProps) {
  const resolvedParams = await params

  return <EditCertificatePageClient id={resolvedParams?.id} />
}
