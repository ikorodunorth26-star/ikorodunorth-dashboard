import { PersonDetailView } from "@/view/dashboard/personDetailView"

const PersonDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>
}) => {
  const { id } = await params
  return <PersonDetailView id={id} />
}

export default PersonDetailPage
