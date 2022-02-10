import type { Request, Response, NextFunction } from "express";
import { PermissionError } from "../../error";

export default function requireManageSiteContentPermission(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.userPermissions.manageSiteContent) {
    res
      .status(403)
      .json(
        new PermissionError(
          "Your user does not have the 'manage site content' permission."
        )
      );

    return;
  }

  next();
}
