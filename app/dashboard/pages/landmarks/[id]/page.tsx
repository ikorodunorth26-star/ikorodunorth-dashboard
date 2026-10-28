import { LandmarkForm } from "@/components/dashboard/content/landmark-form"

const EditLandmarkPage = async ({
  params,
}: {
  params: Promise<{ id: string }>
}) => {
  const { id } = await params
  return <LandmarkForm id={id} />
}

export default EditLandmarkPage
