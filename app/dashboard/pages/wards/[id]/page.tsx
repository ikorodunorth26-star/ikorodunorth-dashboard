import { WardForm } from "@/components/dashboard/content/ward-form"

const EditWardPage = async ({
  params,
}: {
  params: Promise<{ id: string }>
}) => {
  const { id } = await params
  return <WardForm id={id} />
}

export default EditWardPage
