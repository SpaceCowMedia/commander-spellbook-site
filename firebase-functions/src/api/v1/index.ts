import { Router } from "express";
import requireAuthentication from "./middleware/require-authentication";
import user from "./routes/user";

const router = Router();

router.use(requireAuthentication);
router.use("/user", user);

export default router;
