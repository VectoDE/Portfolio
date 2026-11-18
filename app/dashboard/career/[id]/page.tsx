import EditCareerPageClient from "./client-page"

interface EditCareerPageProps {
  params: Promise<{ id?: string }>
}

export default async function EditCareerPage({ params }: Readonly<EditCareerPageProps>) {
  const resolvedParams = await params

  return <EditCareerPageClient id={resolvedParams?.id} />
}
