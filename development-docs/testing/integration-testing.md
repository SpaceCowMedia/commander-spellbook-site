# Integration Testing

Our integration tests use [Cypress](https://www.cypress.io/) as our test runner.

## What to test

Unlike unit tests, we really only want to test broad strokes behavior. The most common usages of the app, to ensure the functionality of the app remains unbroken.

## How to Run the Tests

- Run the firebase emulator. See the [Emulators section](../firebase/updating-firestore-and-functions.md#emulators) of the Firebase documentation for details on how to set it up.
  ```
  npm run firebase:emulate
  ```
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

## Test Users

When the emulators start up, they import users and Firestore documents from the firebase-emulator-seed-data directory.

You can log in as these users within integration tests by using the `cy.login` function with the id of the user you want to log in as. For instance, to log in as a basic user that has the default permissions for a user:

```ts
cy.login("basic-user");
```

Ids of available users to log in as:

- `basic-user` - a user with the initial permissions of a user that has just signed up
- `unprovisioned-user` - a user that has signed up, but has not completed the sign up process of picking a username
- `email-not-verified` - a user that has basic permissions, but has not verified their email
- `site-settings-manager` - a user that has basic permissions and can visit the site-settings page

## Updating Seed Data

To update seed data, run the following command:

```bash
npm run firebase:emulate -- --export-on-exit=firebase-emulator-seed-data
```

Now, any changes you make (adding users, updating documents, etc) will update the seed data that the emulators use once you stop the emulator process.

### Adding new test users

TODO: make a script that can do this programatically

1. With the export flag set, add a user locally in the site.
1. Set whatever permissions/data are necessary for this test user. (TODO, update instructions once managing user permissions is a thing)
1. Stop the emulator process (ctrl + c in the pane running it, typically)
1. Open `./firebase-emualtor-seed-data/auth_export/accounts.json` and find your user
1. Update the `localId` for your user with an id that explains what the user is.
1. Add it to the list of available users in the documentation above.
1. Re-run the emulate command with the export flag
1. Look up the user in user-profiles. Delete the old id and create a new id with the `localId` chosen
1. Look up the user in usernames. Update the `userId` field with the `localId` chosen
1. Commit the change for the new test user.
1. Typically, you'll also add a test for the user.
