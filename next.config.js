/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Updated for Next.js 15
  outputFileTracingIncludes: {
    '/api/**': [],
  },
}

module.exports = nextConfig