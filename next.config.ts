import type { NextConfig } from 'next';

// Deployment builds always go through the Dockerfile, which sets BUILD_TYPE to
// the target environment. Local and CI builds leave it unset, so they serve
// their own assets instead of pointing at the CDN of a deployed environment.
const buildType = process.env.BUILD_TYPE;
const isDeployment = buildType === 'prod' || buildType === 'dev';
const dev = buildType === 'dev' ? 'dev-' : '';

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

const nextConfig: NextConfig = {
  output: isDeployment ? 'standalone' : undefined,
  // Tracing follows the CJS requires it can see and copies only those files, so it takes
  // @swc/helpers' cjs/ and drops its esm/ — but the package is "type": "module", so Next's
  // require hook resolves the ESM subpath at boot and the standalone server dies with
  // MODULE_NOT_FOUND before it can serve anything.
  outputFileTracingIncludes: {
    '/**/*': ['./node_modules/.pnpm/@swc+helpers@*/node_modules/@swc/helpers/**/*'],
  },
  staticPageGenerationTimeout: 120,
  reactStrictMode: true,
  trailingSlash: true,
  productionBrowserSourceMaps: true,
  assetPrefix: isDeployment ? `https://${dev}cdn.commanderspellbook.com` : undefined,
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

export default nextConfig;
