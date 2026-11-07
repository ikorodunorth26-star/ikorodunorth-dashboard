"use client"

import type { FormEvent, ReactNode } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { ContentStatus } from "@/lib"
import { publicSiteUrl } from "@/lib/brand"

type PageDocumentShellProps = {
  heading: string
  blurb: string
  publicPath?: string
  loading: boolean
  saving: boolean
  status: ContentStatus
  onStatusChange: (status: ContentStatus) => void
  onSave: (event: FormEvent) => void
  children: ReactNode
  label?: string
  onLabelChange?: (value: string) => void
  title?: string
  onTitleChange?: (value: string) => void
  description?: string
  onDescriptionChange?: (value: string) => void
  showPageChrome?: boolean
  sidebarNote?: string
}

export function PageDocumentShell({
  heading,
  blurb,
  publicPath,
  loading,
  saving,
  status,
  onStatusChange,
  onSave,
  children,
  label,
  onLabelChange,
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  showPageChrome = true,
  sidebarNote,
}: PageDocumentShellProps) {
  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading {heading}</p>
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={onSave}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-2">
          <Button variant="ghost" size="sm" asChild className="-ml-2 self-start">
            <Link href="/dashboard/pages">Pages</Link>
          </Button>
          <h1 className="text-3xl font-semibold tracking-tight">{heading}</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">{blurb}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {publicPath ? (
            <Button variant="outline" asChild>
              <a
                href={`${publicSiteUrl}${publicPath}`}
                target="_blank"
                rel="noreferrer"
              >
                Public URL
              </a>
            </Button>
          ) : null}
          <Button type="submit" disabled={saving}>
            {saving ? "Saving" : "Save"}
          </Button>
        </div>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="flex flex-col gap-6">
          {showPageChrome ? (
            <Card>
              <CardHeader>
                <CardTitle>Page chrome</CardTitle>
                <CardDescription>
                  Label, title and short description shown with this surface.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {onLabelChange ? (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="page-label">Label</Label>
                    <Input
                      id="page-label"
                      value={label ?? ""}
                      onChange={(event) => onLabelChange(event.target.value)}
                    />
                  </div>
                ) : null}
                {onTitleChange ? (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="page-title">Title</Label>
                    <Textarea
                      id="page-title"
                      rows={2}
                      value={title ?? ""}
                      onChange={(event) => onTitleChange(event.target.value)}
                    />
                  </div>
                ) : null}
                {onDescriptionChange ? (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="page-description">Description</Label>
                    <Textarea
                      id="page-description"
                      rows={3}
                      value={description ?? ""}
                      onChange={(event) => onDescriptionChange(event.target.value)}
                    />
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : null}
          {children}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Publishing</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="page-status">Status</Label>
              <select
                id="page-status"
                className="h-10 rounded-md border bg-background px-3 text-sm"
                value={status}
                onChange={(event) =>
                  onStatusChange(event.target.value as ContentStatus)
                }
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>
            {sidebarNote ? (
              <p className="text-xs leading-5 text-muted-foreground">{sidebarNote}</p>
            ) : null}
            <Button type="submit" disabled={saving}>
              {saving ? "Saving" : "Save changes"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </form>
  )
}
