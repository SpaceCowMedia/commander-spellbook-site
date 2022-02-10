import { Router } from "express";
import requireManageSiteContentMiddleware from "../../middleware/require-manage-site-content-permission";
import updateFeatured from "./update-featured";

const router = Router();

router.use(requireManageSiteContentMiddleware);
router.post("/update-featured", updateFeatured);

export default router;
