import { Router } from "express";
import provision from "./provision";
import managePermissions from "./manage-permissions";

const router = Router();

router.post("/provision", provision);
router.post("/:userId/manage-permissions", managePermissions);

export default router;
