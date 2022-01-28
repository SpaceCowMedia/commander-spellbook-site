import { Router } from "express";
import requireAuthentication from "./middleware/require-authentication";
import user from "./routes/user";
import siteSettings from "./routes/site";

const router = Router();

router.use(requireAuthentication);
router.use("/user", user);
router.use("/site-settings", siteSettings);

export default router;
