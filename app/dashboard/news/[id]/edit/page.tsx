import { NewsForm } from "@/components/dashboard/content/news-form"

const EditNewsPage = async ({
  params,
}: {
  params: Promise<{ id: string }>
}) => {
  const { id } = await params
  return <NewsForm id={id} />
}

export default EditNewsPage
