import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */

  images: {
    remotePatterns: [
      { hostname : "ibefcrigwadqbmziuweb.supabase.co"},
      { hostname : "images.unsplash.com"},
    ]
  }
}

export default nextConfig
