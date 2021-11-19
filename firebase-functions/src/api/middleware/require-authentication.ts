import admin from "firebase-admin";
import type { Request, Response, NextFunction } from "express";
import { PERMISSIONS } from "../../shared/constants";

export default function requireAuthentication(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.headers.authorization) {
    res.status(403).json({ message: "Missing authorization header" });

    return;
  }

  const jwt = req.headers.authorization.trim();
  return admin
    .auth()
    .verifyIdToken(jwt)
    .then((claims) => {
      req.userPermissions = (
        Object.keys(PERMISSIONS) as Array<keyof typeof PERMISSIONS>
      ).reduce((permissions, key) => {
        permissions[key] = claims[PERMISSIONS[key]] === 1;
        return permissions;
      }, {} as Record<string, boolean>);
      req.userId = claims.user_id;

      next();
    })
    .catch(() => {
      res.status(403).json({
        message: "Invalid authorization.",
      });
    });
}
