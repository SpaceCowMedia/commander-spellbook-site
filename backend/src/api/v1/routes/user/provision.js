const admin = require("firebase-admin");
const UserProfile = require("../../../../db/user-profile");
const Username = require("../../../../db/username");
const { setPermissions } = require("../../services/permissions");

module.exports = async function provision(req, res) {
  const username = req.body.username?.trim();
  const userId = req.userId;
  const permissions = req.userPermissions;

  if (!username) {
    res.status(400).json({
      message: "Requires username to provision.",
    });
    return;
  }

  if (permissions.provisioned) {
    res.status(400).json({
      message: "User is already provisioned.",
    });
    return;
  }

  const normalizedUsername = username.toLowerCase().replace(/\s/g, "");

  if (/[^a-z0-9_]/i.test(normalizedUsername)) {
    res.status(400).json({
      message: "Username must only have alphanumeric characters or _.",
    });
    return;
  }

  const usernameTaken = await Username.exists(normalizedUsername);
  if (usernameTaken) {
    res.status(400).json({
      message: `"${username}" is not an available username.`,
    });
    return;
  }

  const auth = admin.auth();

  await Promise.all([
    Username.createWithId(normalizedUsername, {
      userId,
    }),
    UserProfile.createWithId(userId, {
      username,
    }),
    auth.updateUser(userId, {
      displayName: username,
    }),
    setPermissions(userId, {
      provisioned: true,
      proposeCombo: true,
    }),
  ]);

  res.status(201).json({
    permissions: {
      proposeCombo: true,
    },
    username,
  });
};
