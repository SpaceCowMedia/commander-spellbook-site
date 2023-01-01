const { Router } = require("express");
const requireAuthentication = require("./middleware/require-authentication");
const user = require("./routes/user");
const siteSettings = require("./routes/site");

const router = Router();

router.use(requireAuthentication);
router.use("/user", user);
router.use("/site-settings", siteSettings);

module.exports = router;
