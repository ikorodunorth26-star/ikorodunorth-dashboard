import { DepartmentForm } from "@/components/dashboard/content/department-form"

const EditDepartmentPage = async ({
  params,
}: {
  params: Promise<{ id: string }>
}) => {
  const { id } = await params
  return <DepartmentForm id={id} />
}

export default EditDepartmentPage
