import express from "express";
import requireAuthentication from "./middleware/require-authentication";
import user from "./routes/user";

const router = express.Router();

router.use(requireAuthentication);
router.use("/user", user);

export default router;
