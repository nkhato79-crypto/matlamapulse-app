/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jonopdackstnxjzqkzbq.supabase.co',
      },
    ],
  },
}

module.exports = nextConfig
