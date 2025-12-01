/** @type {import('next').NextConfig} */
const nextConfig = {
  // Biome handles linting; skip Next.js ESLint requirement during builds
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
