import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */

  images: {
    remotePatterns: [{ hostname : "www.travelgeekery.com"}]
  }
}

export default nextConfig
