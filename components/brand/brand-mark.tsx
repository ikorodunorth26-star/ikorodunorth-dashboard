import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"

type BrandMarkProps = {
  href?: string
  tone?: "green" | "cream"
  className?: string
}

export function BrandMark({
  href = "/",
  tone = "green",
  className,
}: BrandMarkProps) {
  return (
    <Link
      href={href}
      className={cn("flex min-w-0 items-center gap-2.5", className)}
      aria-label="Ikorodu North LCDA"
    >
      <Image
        src="/images/ikorodu-north-lcda-logo.webp"
        alt=""
        width={56}
        height={56}
        priority
        className="size-11 shrink-0 rounded-full object-cover"
      />
      <span
        className={cn(
          "inline-flex flex-col text-[15px] font-bold uppercase leading-4",
          tone === "cream" ? "text-[#f8f7f2]" : "text-[#173d32]"
        )}
      >
        <span>Ikorodu</span>
        <span>North LCDA</span>
      </span>
    </Link>
  )
}
