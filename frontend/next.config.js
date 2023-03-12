/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
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
