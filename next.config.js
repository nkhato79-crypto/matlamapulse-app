/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://qkcktkdsvlyegguvhprc.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrY2t0a2Rzdmx5ZWdndXZocHJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1NzExNDAsImV4cCI6MjEwMDE0NzE0MH0.y_Q4ksnHd18qKEIugudXkTy3w6Wue5wWtyV5bJQgJnk',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'qkcktkdsvlyegguvhprc.supabase.co',
      },
    ],
  },
}

module.exports = nextConfig
