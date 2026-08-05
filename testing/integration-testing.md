# Integration Testing

Our integration tests use [Cypress](https://www.cypress.io/) as our test runner.

## What to test

Unlike unit tests, we really only want to test broad strokes behavior. The most common usages of the app, to ensure the functionality of the app remains unbroken. One spec per page or feature, and as few tests as possible in each of them.

## The backend the tests run against

The tests run against a local backend with a known, tiny dataset: `/combo/1-2/` is the `Basalt Monolith` + `Mesmeric Orb` combo, `/combo/1-3/` is `Basalt Monolith` + `Forsaken Monument`, and nothing else exists. CI creates it from [commander-spellbook-backend](https://github.com/SpaceCowMedia/commander-spellbook-backend) with `.github/actions/backend`, which starts the backend with `docker compose`, seeds those combos, and creates the account the tests log in with.

To reproduce that locally, clone the backend, run `PORT=8000 docker compose up -d` in it, then run the seeding and account steps of `.github/actions/backend/action.yaml`. `pnpm build:test` and `pnpm start:test` build and serve the app with `NODE_ENV=test`, which points it at `http://127.0.0.1:8000` through `.env.test`.

Note that `pnpm build` only points assets at the CDN when `BUILD_TYPE` is set, which happens solely in the `Dockerfile` used for deployments. Local builds therefore serve their own assets and can be tested as-is.

## How to Run the Tests

One command builds the app, serves it, waits for it to answer on `http://localhost:3000` and then starts the test runner:

| Task                                           | Command                 |
| ---------------------------------------------- | ----------------------- |
| Open the Cypress UI against a test build       | `pnpm cy:dev`           |
| Run the whole suite headlessly against a build | `pnpm test:integration` |
| Open the Cypress UI against the dev server     | `pnpm cy:debug`         |

If you already have the app running, you can start the runner on its own with `pnpm cy:open` or `pnpm cy:run`.

## Logging in

Discord, the only login the app offers, is not reachable from CI, so `cy.login()` asks the backend for a token with the username and password of the test account and stores the same cookies the login page would. Everything it needs is in `cypress.config.ts` (`apiUrl`, `username`, `password`) and every value can be overridden with a `CYPRESS_` prefixed environment variable, which is how the workflow passes the credentials it created the account with.

## Videos/Screenshots

By default, because it takes so long to process video, we have the video and screenshot capabilities turned off. If it's useful to inspect the video of what happened after the tests run, you can append this config flag to the test command:

```
pnpm cy:run --config video=true,videoUploadOnPasses=true,screenshotOnRunFailure=true
```
