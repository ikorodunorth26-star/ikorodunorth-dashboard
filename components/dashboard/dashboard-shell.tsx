"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { BrandMark } from "@/components/brand/brand-mark"
import { cn } from "@/lib/utils"

const navigation = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/news", label: "News" },
  { href: "/dashboard/projects", label: "Projects" },
  { href: "/dashboard/revenue", label: "Revenue" },
  { href: "/dashboard/media", label: "Media" },
]

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-svh bg-background text-foreground md:grid md:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="flex flex-col bg-sidebar text-sidebar-foreground md:min-h-svh">
        <div className="px-5 py-6">
          <BrandMark href="/dashboard" tone="cream" />
        </div>
        <nav aria-label="Dashboard" className="flex gap-1 overflow-x-auto px-3 pb-4 md:flex-1 md:flex-col md:overflow-visible md:pb-6">
          {navigation.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === item.href
                : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white",
                  active && "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-col">
        <header className="flex h-16 items-center border-b border-border px-5 md:px-8">
          <p className="text-sm font-medium text-muted-foreground">
            Council dashboard
          </p>
        </header>
        <main className="flex-1 px-5 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  )
}
