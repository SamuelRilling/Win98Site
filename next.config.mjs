/** @type {import('next').NextConfig} */

// basePath is the sub-path a GitHub Pages *project* site is served under, e.g.
// "/my-portfolio" for https://you.github.io/my-portfolio. The deploy workflow
// derives it automatically from the repo name (PAGES_BASE_PATH), so you should
// not need to set anything here. Empty by default, which is correct for local
// dev and for a root "<user>.github.io" site.
const basePath = process.env.PAGES_BASE_PATH ?? "";

const nextConfig = {
  output: "export",
  basePath: basePath || undefined,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  images: { unoptimized: true },
  // Single-source the basePath so client code can prefix public assets (see lib/utils.ts).
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
