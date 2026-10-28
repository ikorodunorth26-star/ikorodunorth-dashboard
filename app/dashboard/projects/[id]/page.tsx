import { ProjectDetailView } from "@/view/dashboard/projectDetailView"

const ProjectDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>
}) => {
  const { id } = await params
  return <ProjectDetailView id={id} />
}

export default ProjectDetailPage
