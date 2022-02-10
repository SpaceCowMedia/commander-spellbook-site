import admin from "firebase-admin";
import type { Request, Response } from "express";
import { PermissionError, ValidationError, UnknownError } from "../../../error";
import { PERMISSIONS } from "../../../../shared/constants";

export default async function managePermissions(req: Request, res: Response) {
  const adminUserId = req.userId;
  const adminPermissions = req.userPermissions;
  const userId = req.params.userId;
  const permissions = req.body.permissions as Record<
    keyof typeof PERMISSIONS,
    boolean
  >;

  if (!adminPermissions.manageUserPermissions) {
    res
      .status(403)
      .json(
        new PermissionError(
          "You do not have permission to manage another user's permissions"
        )
      );
    return;
  }

  const permissionKeys = Object.keys(permissions || {});

  if (permissionKeys.length === 0) {
    res
      .status(400)
      .json(new ValidationError("Must provide permissions in post body."));
    return;
  }

  const invalidPermissions = permissionKeys.filter(
    (key) =>
      !Object.getOwnPropertyDescriptor(PERMISSIONS, key) ||
      typeof Object.getOwnPropertyDescriptor(permissions, key)?.value !== "boolean"
  );

  if (invalidPermissions.length > 0) {
    res
      .status(400)
      .json(
        new ValidationError(
          `Invalid permission(s): ${invalidPermissions.join(", ")}`
        )
      );
    return;
  }

  // provisioned is the special permission we use to indicate that
  // a user account is fully set up, so it should not be modified
  // in any way outside of the provision route
  if (typeof permissions.provisioned === "boolean") {
    res
      .status(400)
      .json(new ValidationError("Cannot change provisioned permission."));
    return;
  }

  // prevent an admin user from removing the manageUserPermissions option
  // from self. This precents us from accidentally getting into the circumstance
  // where the only admin revokes the ability to manage user permissions
  // and there's no one else that is able to do it
  if (
    adminUserId === userId &&
    typeof permissions.manageUserPermissions === "boolean"
  ) {
    res
      .status(400)
      .json(
        new ValidationError(
          "You cannot change the manage user permissions option for yourself. Enlist another user with the `manage user permissions` permission to do this for you."
        )
      );
    return;
  }

  const auth = admin.auth();
  let currentCustomClaims: Record<string, number>;

  try {
    const userRecord = await auth.getUser(userId);
    currentCustomClaims = userRecord.customClaims || {};
  } catch (e) {
    res
      .status(400)
      .json(new ValidationError(`User with id '${userId}' does not exist.`));
    return;
  }

  // transforms the permissions object to the minified version used in custom claims
  const newCustomClaims = {} as Record<string, number>;
  let key: keyof typeof PERMISSIONS;
  for (key in permissions) {
    const value = permissions[key];
    newCustomClaims[PERMISSIONS[key]] = value ? 1 : 0;
  }

  const finalCustomClaims = {
    ...currentCustomClaims,
    ...newCustomClaims,
  };

  try {
    await auth.setCustomUserClaims(userId, finalCustomClaims);
  } catch (e) {
    res
      .status(500)
      .json(
        new UnknownError(
          `Something went wrong when setting permissions for '${userId}'.`
        )
      );
    return;
  }

  res.status(201).json({
    success: true,
  });
}
