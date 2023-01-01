const { PermissionError } = require("../../error");

module.exports = function requireManageUsersPermission(req, res, next) {
  if (!req.userPermissions.manageUsers) {
    res
      .status(403)
      .json(
        new PermissionError(
          "Your user does not have the 'manage users' permission."
        )
      );

    return;
  }

  next();
};
