import type { Request, Response, NextFunction } from "express";

export default function requireAuthentication(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.userPermissions.manageSiteContent) {
    res.status(403).json({
      message: "Your user does not have the manage site content permission.",
    });

    return;
  }

  next();
}
