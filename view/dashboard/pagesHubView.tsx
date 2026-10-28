"use client"

import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { publicSiteUrl } from "@/lib/brand"

const pageSections = [
  {
    href: "/dashboard/pages/home",
    publicPath: "/",
    eyebrow: "Landing",
    title: "Home",
    description: "Hero, editorial slides, section copy and curated home strips.",
    tone: "from-[#173d32] to-[#2a5a48]",
  },
  {
    href: "/dashboard/pages/about",
    publicPath: "/about",
    eyebrow: "Story",
    title: "About",
    description:
      "Council story, impact figures, history chapters, community CTA and related links.",
    tone: "from-[#1f3b4d] to-[#3d6a7a]",
  },
  {
    href: "/dashboard/pages/contact",
    publicPath: "/contact",
    eyebrow: "Reach us",
    title: "Contact",
    description: "Phones, emails and enquiry topics for the Get in touch page.",
    tone: "from-[#3d4a2e] to-[#6b7a4e]",
  },
  {
    href: "/dashboard/pages/suggest-project",
    publicPath: "/projects/suggest",
    eyebrow: "Ideas",
    title: "Suggest a project",
    description: "Steps, wards, categories, tips and help desk for community suggestions.",
    tone: "from-[#4a3728] to-[#7a5a3e]",
  },
  {
    href: "/dashboard/pages/departments",
    publicPath: "/government/departments",
    eyebrow: "Services",
    title: "Departments page",
    description: "Directory chrome, filters and reach steps for the departments page.",
    tone: "from-[#2e3d4a] to-[#4e6a7a]",
  },
  {
    href: "/dashboard/pages/landmarks",
    publicPath: "/landmarks",
    eyebrow: "Places",
    title: "Landmarks",
    description:
      "Heritage places and culture notes that appear on the landmarks page.",
    tone: "from-[#3d2e4a] to-[#6a4e7a]",
  },
  {
    href: "/dashboard/pages/wards",
    publicPath: "/about#communities",
    eyebrow: "Communities",
    title: "Wards",
    description:
      "The five ward pages: overview, facilities, local projects and concern CTAs.",
    tone: "from-[#2e4a3d] to-[#4e7a6a]",
  },
] as const

const chromeSections = [
  {
    href: "/dashboard/pages/navigation",
    eyebrow: "Chrome",
    title: "Header",
    description: "Primary navigation and Government dropdown links.",
    tone: "from-[#1a2e28] to-[#355a4c]",
  },
  {
    href: "/dashboard/pages/footer",
    eyebrow: "Chrome",
    title: "Footer",
    description: "Headline, CTA, explore links, contact block and legal links.",
    tone: "from-[#1a2428] to-[#35485a]",
  },
  {
    href: "/dashboard/pages/site-config",
    eyebrow: "Shared",
    title: "Site settings",
    description: "Shared phones, emails, address and social links.",
    tone: "from-[#28201a] to-[#5a4535]",
  },
] as const

const collectionSections = [
  {
    href: "/dashboard/pages/departments/items",
    publicPath: "/government/departments",
    eyebrow: "Directory",
    title: "Department items",
    description: "Individual department and unit cards, including ICT detail profile.",
    tone: "from-[#173d32] to-[#3d6a58]",
  },
] as const

function SectionGrid({
  title,
  items,
}: {
  title: string
  items: ReadonlyArray<{
    href: string
    publicPath?: string
    eyebrow: string
    title: string
    description: string
    tone: string
  }>
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((section) => (
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
              <h3 className="text-2xl font-semibold tracking-tight">
                {section.title}
              </h3>
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
                {section.publicPath ? (
                  <Button variant="outline" asChild>
                    <a
                      href={`${publicSiteUrl}${section.publicPath}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Public page
                    </a>
                  </Button>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export function PagesHubView() {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium tracking-[0.14em] text-muted-foreground uppercase">
          Website content
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Pages</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Edit public pages, site chrome and directory collections without touching
          the website codebase.
        </p>
      </div>

      <SectionGrid title="Pages" items={pageSections} />
      <SectionGrid title="Header, footer & settings" items={chromeSections} />
      <SectionGrid title="Collections" items={collectionSections} />
    </div>
  )
}
