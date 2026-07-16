import type React from "react"
import type { Metadata } from "next"
import { asset } from "@/lib/utils"
import { site } from "@/site.config"
import "./globals.css"

export const metadata: Metadata = {
  title: site.identity.metaTitle,
  description: site.identity.metaDescription,
  icons: {
    icon: [{ url: asset("/icon.svg"), type: "image/svg+xml" }],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
