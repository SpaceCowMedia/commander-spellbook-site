# Integration Testing

Our integration tests use [Cypress](https://www.cypress.io/) as our test runner.

## What to test

Unlike unit tests, we really only want to test broad strokes behavior. The most common usages of the app, to ensure the functionality of the app remains unbroken.

## How to Run the Tests

* Run the firebase emulator. See the [Emulators section](../firebase/updating-firestore-and-functions.md#emulators) of the Firebase documentation for details on how to set it up.
    ```
    npm run firebase:emulate
    ```
* Run the app
    ```
    npm run dev
    ```
* Run the tests
    ```
    npm run cy:run
    ```
