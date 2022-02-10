import { Router } from "express";
import provision from "./provision";

const router = Router();

router.post("/provision", provision);

export default router;
