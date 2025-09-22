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
  experimental: {
    // Reduce build tracing recursion
    outputFileTracingIncludes: {
      '/api/**': [],
    },
  },
  // Exclude problematic patterns from build tracing
  outputFileTracing: true,
}

module.exports = nextConfig