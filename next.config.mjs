/** @type {import('next').NextConfig} */
const basePath = "/Win98Site";

const nextConfig = {
  output: "export",
  basePath,
  assetPrefix: `${basePath}/`,
  images: { unoptimized: true },
  // Single-source the basePath so client code can prefix public assets (see lib/utils.ts).
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
