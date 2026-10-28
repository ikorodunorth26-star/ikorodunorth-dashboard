import { ProjectForm } from "@/components/dashboard/content/project-form"

const EditProjectPage = async ({
  params,
}: {
  params: Promise<{ id: string }>
}) => {
  const { id } = await params
  return <ProjectForm id={id} />
}

export default EditProjectPage
