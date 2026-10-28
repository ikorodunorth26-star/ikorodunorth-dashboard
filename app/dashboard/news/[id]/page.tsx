import { NewsDetailView } from "@/view/dashboard/newsDetailView"

const NewsDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>
}) => {
  const { id } = await params
  return <NewsDetailView id={id} />
}

export default NewsDetailPage
