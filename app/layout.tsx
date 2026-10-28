import { Metadata, Viewport } from "next"
import { Toaster } from "sonner"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { siteDescription, siteName } from "@/lib/brand"
import { Satoshi } from "@/lib/font"
import { cn } from "@/lib"

export const metadata: Metadata = {
  title: {
    default: siteName,
    template: `%s · ${siteName}`,
  },
  description: siteDescription,
  icons: {
    icon: [
      { url: "/images/ikorodu-north-lcda-logo.webp", type: "image/webp" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: "/images/ikorodu-north-lcda-logo.webp",
    shortcut: "/images/ikorodu-north-lcda-logo.webp",
  },
}

export const viewport: Viewport = {
  themeColor: [
    {
      media: "(prefers-color-scheme: light)",
      color: "#f8f5ed",
    },
    {
      media: "(prefers-color-scheme: dark)",
      color: "#102d26",
    },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased font-sans", Satoshi.variable)}
    >
      <body className="scroll-smooth bg-background">
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster position="top-right" richColors expand={false} />
      </body>
    </html>
  )
}
