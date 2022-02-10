import type { Request, Response } from "express";
import SiteSetting from "../../../../db/site-setting";

export default async function featured(req: Request, res: Response) {
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
}
