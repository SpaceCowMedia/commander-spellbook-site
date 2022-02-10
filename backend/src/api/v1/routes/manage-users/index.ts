import { Router } from "express";
import requireManageUsersPermission from "../../middleware/require-manage-users-permission";
import managePermissions from "./permissions";

const router = Router();

router.use(requireManageUsersPermission);
router.post("/:userId/permissions", managePermissions);

export default router;
