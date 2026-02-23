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
  webpack: (config, { isServer }) => {
    // Enable SVGR for importing SVGs as React components
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            svgo: true,
            svgoConfig: {
              plugins: [
                {
                  name: 'preset-default',
                  params: { overrides: { removeViewBox: false } },
                },
              ],
            },
          },
        },
      ],
    });
    
    // Exclude get-project-images.ts from client bundle (it uses Node.js fs)
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    
    return config;
  }
}

module.exports = nextConfig 