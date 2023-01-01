const { Router } = require("express");
const provision = require("./provision");

const router = Router();

router.post("/provision", provision);

module.exports = router;
