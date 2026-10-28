import { PersonForm } from "@/components/dashboard/content/person-form"

const EditPersonPage = async ({
  params,
}: {
  params: Promise<{ id: string }>
}) => {
  const { id } = await params
  return <PersonForm id={id} />
}

export default EditPersonPage
