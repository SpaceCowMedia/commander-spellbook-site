import { Router } from "express";
import managePermissions from "./permissions";

const router = Router();

router.post("/:userId/permissions", managePermissions);

export default router;
