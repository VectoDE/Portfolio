import EditSkillPageClient from "./client-page"

interface EditSkillPageProps {
  params: Promise<{ id?: string }>
}

export default async function EditSkillPage({ params }: EditSkillPageProps) {
  const resolvedParams = await params

  return <EditSkillPageClient id={resolvedParams?.id} />
}
