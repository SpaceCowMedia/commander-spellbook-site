/** @type {import('next').NextConfig} */
const isLocalServer = process.env.NODE_ENV === 'development'
const beta = process.env.BUILD_TYPE === 'beta' ? 'beta' : ''

const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  trailingSlash: true,
  productionBrowserSourceMaps: true,
  assetPrefix: !isLocalServer ? `https://${beta}cdn.commanderspellbook.com` : undefined,
  images: {
    unoptimized: true,
  },
  webpack(webpackConfig) {
    return {
      ...webpackConfig,
      optimization: {
        minimize: false, // SSG for combo pages fails to accept routes after the first if the code is minified - only went built (not dev server)
      },
    };
  },
};

module.exports = nextConfig;
