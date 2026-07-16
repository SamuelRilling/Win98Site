/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/Win98Site",
  assetPrefix: "/Win98Site/",
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
};
export default nextConfig;
