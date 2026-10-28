"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Briefcase01Icon,
  DashboardSquare01Icon,
  File01Icon,
  Image01Icon,
  Invoice01Icon,
  Logout01Icon,
  News01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { TooltipProvider } from "@/components/ui/tooltip"
import {
  clearReturnPath,
  clearSession,
  logout,
  readSession,
  saveReturnPath,
  staffRoleLabel,
  type AuthSession,
} from "@/lib"

const navigation = [
  { href: "/dashboard", label: "Overview", icon: DashboardSquare01Icon },
  { href: "/dashboard/news", label: "News", icon: News01Icon },
  { href: "/dashboard/projects", label: "Projects", icon: Briefcase01Icon },
  { href: "/dashboard/people", label: "People", icon: UserGroupIcon },
  { href: "/dashboard/pages", label: "Pages", icon: File01Icon },
  { href: "/dashboard/revenue", label: "Revenue", icon: Invoice01Icon },
  { href: "/dashboard/media", label: "Media", icon: Image01Icon },
]

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href
  return pathname.startsWith(href)
}

function initials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [session, setSession] = useState<AuthSession | null>(null)
  const current =
    navigation.find((item) => isActive(pathname, item.href)) ?? navigation[0]

  useEffect(() => {
    const currentSession = readSession()
    if (!currentSession) {
      saveReturnPath(`${pathname}${window.location.search}`)
      router.replace("/auth/signin")
      return
    }
    setSession(currentSession)
  }, [pathname, router])

  async function signOut() {
    const refreshToken = session?.refreshToken
    clearSession()
    clearReturnPath()
    if (refreshToken) {
      try {
        await logout(refreshToken)
      } catch {
        // Local session is already cleared.
      }
    }
    router.replace("/auth/signin")
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <Sidebar collapsible="icon" variant="inset">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" asChild tooltip="Ikorodu North LCDA">
                  <Link href="/dashboard">
                    <Image
                      src="/images/ikorodu-north-lcda-logo.webp"
                      alt=""
                      width={32}
                      height={32}
                      className="size-8 rounded-full object-cover"
                    />
                    <span className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">Ikorodu</span>
                      <span className="truncate text-xs">North LCDA</span>
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Council</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigation.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(pathname, item.href)}
                        tooltip={item.label}
                      >
                        <Link href={item.href}>
                          <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Sign out" onClick={() => void signOut()}>
                  <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} />
                  <span>Sign out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex h-4 items-center">
              <Separator orientation="vertical" />
            </div>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:inline-flex">
                  <BreadcrumbLink asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:inline-flex" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{current.label}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="ml-auto flex items-center gap-3">
              {session ? (
                <>
                  <div className="hidden min-w-0 text-right sm:block">
                    <p className="truncate text-sm font-medium leading-tight">
                      {session.user.firstName} {session.user.lastName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {staffRoleLabel(session.user.role)}
                    </p>
                  </div>
                  <Avatar>
                    <AvatarFallback>
                      {initials(session.user.firstName, session.user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                </>
              ) : (
                <>
                  <div className="hidden flex-col items-end gap-1 sm:flex">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="size-8 rounded-full" />
                </>
              )}
            </div>
          </header>
          <div className="flex flex-1 flex-col px-5 py-6 md:px-8 md:py-8">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
