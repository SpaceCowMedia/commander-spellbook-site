# Before you start

If you do not have access to the Firebase console for the project, you will not be able to deploy changes to the Firestore configuration and Functions. If you believe you should have access, discuss it with the moderators in the [Commander Spellbook Discord server](https://discord.gg/KDnvP5f).

# Firestore

This is where the app's data is stored. Current collections are:

```
usernames
user-permissions
```

## usernames

We use Firebase auth to do sign up/log in, which is great for managing authorization, but does not have a uniqueness contstraint on display names by default.

So instead, we create a username document for each user and use it to display a unique name for each user.

## user-permissions

We need to limit what users are allowed to do, so we have a collection where the unique user id of the user is the key. The permissions are as follows:

* propose_combo - can submit new combos for review on the site
* edit_proposed_combo - can edit a combo proposed for the site and mark it as ready for final review
* reject_proposed_combo - can mark a proposed combo as rejected
* manage_user_permissions - can change the user permissions of another user

## Indexes

TODO

## Rules

The [`firestore.rules`](../firestore.rules) file dictates the changes that can be made to documents in the Firestore database on the client. These rules do not apply when using functions along with the `firebase-admin` module.

# Functions




# Deploys

First, log in to Firebase.

```
npx firebase-tools login
```

TODO - document how to switch projects, local, staging, production??

Then, deploy the changes to the Firestore configuration and Functions.

```
npx firebase-tools deploy
```
