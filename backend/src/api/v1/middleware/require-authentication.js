const admin = require("firebase-admin");
const { transformClaimsToPermissions } = require("../services/permissions");

module.exports = async function requireAuthentication(req, res, next) {
  // TODO change all these json messages to permission errors
  if (!req.headers.authorization) {
    res.status(403).json({ message: "Missing authorization header." });

    return;
  }

  const jwt = req.headers.authorization.trim().split("Bearer ")[1];

  if (!jwt) {
    res.status(403).json({ message: "Authorization header is malformed." });

    return;
  }

  try {
    const claims = await admin.auth().verifyIdToken(jwt);

    req.userPermissions = transformClaimsToPermissions(claims);
    req.userId = claims.user_id;

    next();
  } catch (err) {
    res.status(403).json({
      message: "Invalid authorization.",
    });
  }
};
