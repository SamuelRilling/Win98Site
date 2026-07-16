import type React from "react"
import type { Metadata } from "next"
import { asset } from "@/lib/utils"
import "./globals.css"

export const metadata: Metadata = {
  title: "Jessin Sam S — Portfolio",
  description: "The portfolio of Jessin Sam S, presented as a nostalgic Windows 98 desktop.",
  icons: {
    icon: [
      {
        url: asset("/icon-light-32x32.png"),
        media: "(prefers-color-scheme: light)",
      },
      {
        url: asset("/icon-dark-32x32.png"),
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: asset("/icon.svg"),
        type: "image/svg+xml",
      },
    ],
    apple: asset("/apple-icon.png"),
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
