import { defineConfig } from 'cypress';

export default defineConfig({
  defaultCommandTimeout: 30000,
  screenshotOnRunFailure: false,
  video: false,
  e2e: {
    baseUrl: 'http://localhost:3000',
  },
  blockHosts: '*.google-analytics.com',
  retries: {
    runMode: 2,
  },
});
