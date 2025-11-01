import EditProjectPageClient from "./client-page"

interface EditProjectPageProps {
  params: Promise<{ id?: string }>
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const resolvedParams = await params

  return <EditProjectPageClient id={resolvedParams?.id} />
}
