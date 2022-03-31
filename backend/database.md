# Firestore

We use a NoSQL [Firestore Database](https://firebase.google.com/products/firestore) to hold the site's data.

(currently, the combos still live in [Google Sheets](https://docs.google.com/spreadsheets/d/1KqyDRZRCgy8YgMFnY0tHSw_3jC99Z0zFvJrPbfm66vA/), but we intend to move that over to Firestor in the near future)

## Collections

Current collections are:

- [site-settings](#site-settings)
- [user-profiles](#user-profiles)
- [usernames](#usernames)

They can be used in the [api](./api.md) via the database model abstractions found at `/backend/db/*.ts`.

### Site Settings

This collection is for data on the site that may need to be updated by a user with the `manageSiteContent` permission.

So far, the only document is `featured-combos` which includes the button text display on the home page for featured combos and determines the rules by which combos are selected to be featured.

### User Profiles

This collection contains additional data about the user, such as the user's username. The key for each user-profile is the user id of the owner.

### Usernames

This collection is to enforce a uniqueness constraint on the user's username. The key is the user's username, but with all lowercase letters and punctuation removed.

## Rules

The [`firestore.rules`](../../firestore.rules) file dictates the changes that can be made to documents in the Firestore database on the client. Warning: these rules do not apply when using functions along with the `firebase-admin` module.

Typically, changes to the database will all run through the API (which use the `firebase-admin` module). Exceptions can happen for loading data into the site from a read-only model. (such as creating the featured combos page)
