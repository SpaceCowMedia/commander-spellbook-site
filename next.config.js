/** @type {import('next').NextConfig} */
const isLocalServer = process.env.NODE_ENV === 'development'
const beta = process.env.BUILD_TYPE === 'beta' ? 'beta' : ''


const OPEN_CORS_HEADERS = [
  // Allow for specific domains to have access or * for all
  {
    key: "Access-Control-Allow-Origin",
    value: "*",
    // DOES NOT WORK
    // value: process.env.ALLOWED_ORIGIN,
  },
  // Allows for specific methods accepted
  {
    key: "Access-Control-Allow-Methods",
    value: "GET, POST, PUT, DELETE, OPTIONS",
  },
  // Allows for specific headers accepted (These are a few standard ones)
  {
    key: "Access-Control-Allow-Headers",
    value: "Content-Type, Authorization, Origin",
  },
]
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
  // async headers() {
  //   return [
  //     {
  //       source: "/embed.js",
  //       headers: OPEN_CORS_HEADERS,
  //    },
  //     {
  //       source: "/combo/859-2569-4289-4452/embed",
  //       headers: OPEN_CORS_HEADERS,
  //     }
  //
  //   ]
  // }

};

module.exports = nextConfig;
