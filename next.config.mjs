/** @type {import('next').NextConfig} */
const nextConfig = {
  // Base path for deployment
  basePath: "/admin-dashboard",

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
