/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://wmzxmcolqzljjzdwdbmu.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtenhtY29scXpsamp6ZHdkYm11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2MDAyNzUsImV4cCI6MjEwMTE3NjI3NX0.r1rFlBbn7ZNgBeh6kmt5ojUvF2quvyG1ABzBrlssxa0',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wmzxmcolqzljjzdwdbmu.supabase.co',
      },
    ],
  },
}

module.exports = nextConfig
