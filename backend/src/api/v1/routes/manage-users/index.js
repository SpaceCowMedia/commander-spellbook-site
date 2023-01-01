const { Router } = require("express");
const requireManageUsersPermission = require("../../middleware/require-manage-users-permission");
const managePermissions = require("./permissions");

const router = Router();

router.use(requireManageUsersPermission);
router.post("/:userId/permissions", managePermissions);

module.exports = router;
