import { logger } from "firebase-functions";
import type { Request, Response } from "express";
import { ValidationError, UnknownError } from "../../../error";
import {
  Permissions,
  getPermissions,
  setPermissions,
  validatePermissions,
} from "../../services/permissions";

export default async function managePermissions(req: Request, res: Response) {
  const targetUserId = req.params.userId;
  const permissions = (req.body.permissions || {}) as Permissions;

  try {
    await validatePermissions(permissions);

    // prevent a the user making the API request from removing the manageUsers option
    // from themself. This prevents us from accidentally getting into the circumstance
    // where the only admin revokes the ability to manage users and then there's no one
    // else that is able to do it
    if (
      req.userId === targetUserId &&
      typeof permissions.manageUsers === "boolean"
    ) {
      throw new ValidationError(
        "You cannot change the manage users option for yourself. Enlist another user with the `manage user permissions` permission to do this for you."
      );
    }

    const currentPermissions = await getPermissions(targetUserId);
    const finalPermissions = {
      ...currentPermissions,
      ...permissions,
    };

    await setPermissions(targetUserId, finalPermissions);

    logger.info(
      `${req.userId} set custom user claims for ${targetUserId}:`,
      finalPermissions
    );
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).json(err);
    } else {
      res
        .status(500)
        .json(
          new UnknownError(
            `Something went wrong when user with id '${req.userId}' changed the permissions for user with id '${targetUserId}'.`,
            err
          )
        );
    }
    return;
  }

  res.status(201).json({
    success: true,
  });
}
