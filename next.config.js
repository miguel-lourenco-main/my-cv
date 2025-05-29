/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Remove basePath by default - will be set via environment variable if needed
  basePath: process.env.NODE_ENV === 'production' ? process.env.BASE_PATH || '' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? process.env.BASE_PATH || '' : '',
}

module.exports = nextConfig 