import { defineConfig } from 'cypress';

export default defineConfig({
  defaultCommandTimeout: 30000,
  screenshotOnRunFailure: false,
  video: false,
  e2e: {
    baseUrl: 'http://localhost:3000',
  },
  // Every value can be overridden with a CYPRESS_ prefixed environment variable.
  env: {
    apiUrl: 'http://127.0.0.1:8000',
    username: 'cypress',
    password: 'cypress-password',
  },
  blockHosts: '*.google-analytics.com',
  retries: {
    runMode: 3,
  },
});
