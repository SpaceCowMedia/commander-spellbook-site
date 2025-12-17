/** @type {import('next').NextConfig} */
const { PHASE_DEVELOPMENT_SERVER, PHASE_TEST } = require('next/constants');

const dev = process.env.BUILD_TYPE === 'dev' ? 'dev-' : '';

const OPEN_CORS_HEADERS = [
  // Allow for specific domains to have access or * for all
  {
    key: 'Access-Control-Allow-Origin',
    value: '*',
    // DOES NOT WORK
    // value: process.env.ALLOWED_ORIGIN,
  },
  // Allows for specific methods accepted
  {
    key: 'Access-Control-Allow-Methods',
    value: 'GET, POST, PUT, DELETE, OPTIONS',
  },
  // Allows for specific headers accepted (These are a few standard ones)
  {
    key: 'Access-Control-Allow-Headers',
    value: 'Content-Type, Authorization, Origin',
  },
];

module.exports = (phase, { _defaultConfig }) => {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;
  const isTest = phase === PHASE_TEST || 'CI' in process.env;
  return {
    output: !isDev && !isTest ? 'standalone' : undefined,
    staticPageGenerationTimeout: 120,
    reactStrictMode: true,
    trailingSlash: true,
    productionBrowserSourceMaps: true,
    assetPrefix: !isDev && !isTest ? `https://${dev}cdn.commanderspellbook.com` : undefined,
    images: {
      unoptimized: true,
    },
    serverRuntimeConfig: {
      PROJECT_ROOT: __dirname,
    },
    webpack(webpackConfig) {
      return {
        ...webpackConfig,
        optimization: {
          minimize: false, // SSG for combo pages fails to accept routes after the first if the code is minified - only went built (not dev server)
        },
      };
    },
    async headers() {
      return [
        {
          source: '/embed.js',
          headers: OPEN_CORS_HEADERS,
        },
      ];
    },
    sassOptions: {
      silenceDeprecations: ['legacy-js-api'],
    },
    async redirects() {
      return [
        {
          source: '/ads.txt',
          destination: 'https://adstxt.mediavine.com/sites/commander-spellbook/ads.txt',
          permanent: false,
        },
        {
          source: '/how-to-submit-a-combo',
          destination: '/submit-a-combo',
          permanent: true,
        },
      ];
    },
  };
};
