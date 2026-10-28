"use client"

import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { publicSiteUrl } from "@/lib/brand"

const sections = [
  {
    href: "/dashboard/pages/about",
    publicPath: "/about",
    eyebrow: "Story",
    title: "About",
    description:
      "Council story, impact figures, history chapters, community CTA and related links.",
    tone: "from-[#173d32] to-[#2a5a48]",
  },
  {
    href: "/dashboard/pages/landmarks",
    publicPath: "/landmarks",
    eyebrow: "Places",
    title: "Landmarks",
    description:
      "Heritage places and culture notes that appear on the landmarks page and About teaser.",
    tone: "from-[#3d4a2e] to-[#6b7a4e]",
  },
  {
    href: "/dashboard/pages/wards",
    publicPath: "/about#communities",
    eyebrow: "Communities",
    title: "Wards",
    description:
      "The five ward pages: overview, facilities, local projects and concern CTAs.",
    tone: "from-[#1f3b4d] to-[#3d6a7a]",
  },
] as const

export function PagesHubView() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium tracking-[0.14em] text-muted-foreground uppercase">
          Website content
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Pages</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Edit the public About story, landmarks directory and ward community pages
          without touching the website codebase.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {sections.map((section) => (
          <article
            key={section.href}
            className="flex flex-col overflow-hidden rounded-2xl border bg-card"
          >
            <div
              className={`flex aspect-[5/3] flex-col justify-end bg-gradient-to-br p-5 text-background ${section.tone}`}
            >
              <p className="text-xs tracking-[0.16em] uppercase opacity-80">
                {section.eyebrow}
              </p>
              <h2 className="text-2xl font-semibold tracking-tight">{section.title}</h2>
            </div>
            <div className="flex flex-1 flex-col gap-4 p-5">
              <p className="text-sm leading-6 text-muted-foreground">
                {section.description}
              </p>
              <Badge variant="outline">Editable</Badge>
              <div className="mt-auto flex flex-wrap gap-2">
                <Button asChild>
                  <Link href={section.href}>Open editor</Link>
                </Button>
                <Button variant="outline" asChild>
                  <a
                    href={`${publicSiteUrl}${section.publicPath}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Public page
                  </a>
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
