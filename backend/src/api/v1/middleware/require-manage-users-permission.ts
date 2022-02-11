import type { Request, Response, NextFunction } from "express";
import { PermissionError } from "../../error";

export default function requireManageUsersPermission(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.userPermissions.manageUsers) {
    res
      .status(403)
      .json(
        new PermissionError(
          "Your user does not have the 'manage users' permission."
        )
      );

    return;
  }

  next();
}
