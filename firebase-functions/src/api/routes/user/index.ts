import express from "express";
import provision from "./provision";

const router = express.Router();

router.post("/provision", provision);

export default router;
