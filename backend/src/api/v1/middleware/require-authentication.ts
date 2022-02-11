import admin from "firebase-admin";
import type { Request, Response, NextFunction } from "express";
import { transformClaimsToPermissions } from "../services/permissions";

export default async function requireAuthentication(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // TODO change all these json messages to permission errors
  if (!req.headers.authorization) {
    res.status(403).json({ message: "Missing authorization header." });

    return;
  }

  const jwt = req.headers.authorization.trim().split("Bearer ")[1];

  if (!jwt) {
    res.status(403).json({ message: "Authorization header is malformed." });

    return;
  }

  try {
    const claims = await admin.auth().verifyIdToken(jwt);

    req.userPermissions = transformClaimsToPermissions(claims);
    req.userId = claims.user_id;

    next();
  } catch (err) {
    res.status(403).json({
      message: "Invalid authorization.",
    });
  }
}
