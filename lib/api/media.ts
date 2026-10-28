import { apiRequest } from "./client"

export type UploadedImage = {
  id: string
  url: string
  alt: string
  width: number | null
  height: number | null
}

export async function uploadImage(file: File, alt?: string): Promise<UploadedImage> {
  const body = new FormData()
  body.append("file", file)
  if (alt?.trim()) body.append("alt", alt.trim())
  const result = await apiRequest<{ file: UploadedImage }>("/v1/media", {
    method: "POST",
    body,
  })
  return result.file
}
