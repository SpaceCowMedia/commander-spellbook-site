# Deplopying to Firebase

## Before you start

If you do not have access to the Firebase console for the project, you will not be able to deploy changes to the Firestore configuration and Functions. If you believe you should have access, discuss it with the moderators in the [Commander Spellbook Discord server](https://discord.gg/KDnvP5f).

## Deploys

First, log in to Firebase. (if you are not a member of the Firebase project you are attemptting to deploy to, you will be unable to do the deploys)

```bash
npm run firebase:login
```

Choose the environment you are deploying to:

```bash
npm run firebase:deploy:local
npm run firebase:deploy:staging
npm run firebase:deploy:prod
```

Whenever you deploy to `staging` or `prod`, it will auto switch back the context to `local` when it finishes.

`prod` and `local` automatically deploy whenever the site is deployed via [Github Actions](https://github.com/features/actions).
