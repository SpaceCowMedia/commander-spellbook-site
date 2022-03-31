# User Accounts

## Email Link

We use the [Firebase Email Link strategy](https://firebase.google.com/docs/auth/web/email-link-auth) for creating accounts and logging in. Basically, instead of having our users remember a password to log in, they simply enter their email and then click the link that gets emailed to them. That opens them back on the website and they are logged in!

## User Permissions

After a user logs in for the first time, the site will automatically attempt to `provision` the user. This essentially means that the site will validate that the user's chosen username is available and then the user will be given the default permissions for actions on the site. Namely, the ability to propose new combos.

Every time the user loads the user dashboard, the site will check if the user has already been provisioned, and then display the parts of the dashboard they are allowed to see.

An administrator with the `manageUsers` permission can modify what a user is allowed to do as well as details about the user (such as display name, their email or username).

Here are the following permissions a user can have:

- `provisioned` - when `true`, the user is created and ready to be used on the site. Not really used for anything other than to determine that the user is fully set up and the initial permissions have been set.
- `proposeCombo` - can submit new combos for review on the site
- `manageUsers` - can change the user permissions and user details of another user
- `manageSiteContent` - can change site settings, such as the parameters for what featured combos there are
- `viewUsers` - inspect, but not manage users
