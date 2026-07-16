import type React from "react"

/** Deploy base path, injected from next.config.mjs. Empty in dev, "/Win98Site" in production. */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

/**
 * Prefix a public-folder path with the deploy basePath.
 * Next.js does NOT auto-apply basePath to plain <img src="/...">, so static
 * assets must be prefixed manually or they 404 on GitHub Pages.
 */
export function asset(path: string): string {
  return `${BASE_PATH}${path}`
}

/** Fallback to the local placeholder (basePath-aware) when an image fails to load. */
export function onImgError(e: React.SyntheticEvent<HTMLImageElement>): void {
  e.currentTarget.onerror = null
  e.currentTarget.src = asset("/placeholder.svg")
}
