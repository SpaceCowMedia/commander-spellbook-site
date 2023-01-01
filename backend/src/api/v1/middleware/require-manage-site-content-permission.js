const { PermissionError } = require("../../error");

module.exports = function requireManageSiteContentPermission(req, res, next) {
  if (!req.userPermissions.manageSiteContent) {
    res
      .status(403)
      .json(
        new PermissionError(
          "Your user does not have the 'manage site content' permission."
        )
      );

    return;
  }

  next();
};
