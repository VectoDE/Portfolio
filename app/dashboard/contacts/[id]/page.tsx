import ContactDetailsPageClient from "./client-page"

interface ContactDetailsPageProps {
  params: Promise<{ id?: string }>
}

export default async function ContactDetailsPage({ params }: ContactDetailsPageProps) {
  const resolvedParams = await params

  return <ContactDetailsPageClient id={resolvedParams?.id} />
}
