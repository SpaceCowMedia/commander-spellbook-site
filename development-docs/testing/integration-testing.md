# Integration Testing

Our integration tests use [Cypress](https://www.cypress.io/) as our test runner.

## What to test

Unlike unit tests, we really only want to test broad strokes behavior. The most common usages of the app, to ensure the functionality of the app remains unbroken.

## How to Run the Tests

- Run the app
  ```
  npm run dev
  ```
- Run the tests
  ```
  npm run cy:run
  ```

## Videos/Screenshots

By default, because it takes so long to process video, we have the video and screenshot capabilities turned off. If it's useful to inspect the video of what happened after the tests run, you can append this config flag to the test command:

```
npm run cy:run -- --config video=true,videoUploadOnPasses=true,screenshotOnRunFailure=true
```
