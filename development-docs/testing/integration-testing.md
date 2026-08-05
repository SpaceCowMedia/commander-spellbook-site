# Integration Testing

Our integration tests use [Cypress](https://www.cypress.io/) as our test runner.

## What to test

Unlike unit tests, we really only want to test broad strokes behavior. The most common usages of the app, to ensure the functionality of the app remains unbroken.

## How to Run the Tests

The quickest way is to let one command build the app, serve it, wait for it to answer on `http://localhost:3000` and then start the test runner:

| Task                                           | Command                 |
| ---------------------------------------------- | ----------------------- |
| Open the Cypress UI against a production build | `pnpm cy:dev`           |
| Open the Cypress UI against the dev server     | `pnpm cy:debug`         |
| Run the whole suite headlessly against a build | `pnpm test:integration` |

If you already have the app running (`pnpm dev` or `pnpm build && pnpm start`), you can start the runner on its own with `pnpm cy:open` or `pnpm cy:run`.

Note that `pnpm build` only points assets at the CDN when `BUILD_TYPE` is set, which happens solely in the `Dockerfile` used for deployments. Local builds therefore serve their own assets and can be tested as-is.

### Backend data

The tests expect the seeded data of a local backend (for example, `/combo/1-2/` is the `Basalt Monolith` + `Mesmeric Orb` combo), which CI starts from [commander-spellbook-backend](https://github.com/SpaceCowMedia/commander-spellbook-backend) via `.github/actions/backend`. Run that backend with `docker compose up` on port `8000` and point `NEXT_PUBLIC_EDITOR_BACKEND_URL` at `http://127.0.0.1:8000` (the value already in `.env.test`) to reproduce the CI results. Against the public backend, specs that rely on that seeded data will fail, and a full run may get rate limited.

## Videos/Screenshots

By default, because it takes so long to process video, we have the video and screenshot capabilities turned off. If it's useful to inspect the video of what happened after the tests run, you can append this config flag to the test command:

```
pnpm cy:run --config video=true,videoUploadOnPasses=true,screenshotOnRunFailure=true
```
