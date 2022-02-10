# Running the App Locally

By default, when you run the frontend app locally, it'll connect to a special Firebase app dedicated for local development of Commander Spellbook. This app gets updates deployed to it automatically whenever updates are deployed to the production Firebase app.

If you do not need to make any changes to the backend Firebase code, you can just [run the site normally](../frontend/installation-and-setup.md), and it'll connect to the local development instance of Firebase.

## Emulators

If you _do_ need to make changes, you can do so by running the Firebase emulators to see your changes locally without deploying them.

To run the functions, firestore and auth locally, first create or modify an `.env` file in the root of the repository with `USE_FIREBASE_EMULATORS` set to true and `NODE_ENV` set to development:

```bash
USE_FIREBASE_EMULATORS=true
NODE_ENV=development
```

You will also need [Java](https://www.java.com/) installed on your machine to run the emulators.

Once those tasks are complete, run:

```bash
npm run firebase:emulate
```

The firebase emulators will start running. Once the frontend app is running, you should see a warning on the bottom of the screen of the app that it is using local emulators.

Running the emulators will allow you to test changes without modifying any data or deploying changes to the local development instance of the Firebase project.
