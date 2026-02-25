import type { NextConfig } from 'next';
import { PHASE_DEVELOPMENT_SERVER, PHASE_TEST } from 'next/constants';

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

const nextConfig: (phase: string) => NextConfig = (phase) => {
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

export default nextConfig;
