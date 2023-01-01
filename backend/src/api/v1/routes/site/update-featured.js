const SiteSetting = require("../../../../db/site-setting");

module.exports = async function featured(req, res) {
  try {
    await SiteSetting.updateFeaturedSettings({
      buttonText: req.body.buttonText,
      rules: req.body.rules,
    });
  } catch (e) {
    res.status(400).json(e);

    return;
  }

  res.status(200).json({
    success: true,
  });
};
