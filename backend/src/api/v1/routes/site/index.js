const { Router } = require("express");
const requireManageSiteContentMiddleware = require("../../middleware/require-manage-site-content-permission");
const updateFeatured = require("./update-featured");

const router = Router();

router.use(requireManageSiteContentMiddleware);
router.post("/update-featured", updateFeatured);

module.exports = router;
