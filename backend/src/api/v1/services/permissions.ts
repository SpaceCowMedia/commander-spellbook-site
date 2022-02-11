import admin from "firebase-admin";
import { PERMISSIONS } from "../../../shared/constants";
import { ValidationError } from "../../error";

type PermissionKey = keyof typeof PERMISSIONS;
type Permissions = Record<PermissionKey, boolean>;
type ClaimKey = typeof PERMISSIONS[PermissionKey];
type PermissionClaims = Record<ClaimKey, 1>;

const VALID_PERMISSION_KEYS = Object.keys(PERMISSIONS) as PermissionKey[];

export async function getPermissions(userId: string): Promise<Permissions> {
  const auth = admin.auth();
  const userRecord = await auth.getUser(userId);
  const claims = userRecord.customClaims || {};

  return VALID_PERMISSION_KEYS.reduce((accum, key) => {
    const claimsKey = PERMISSIONS[key];
    const hasPermission = claims[claimsKey] === 1;

    accum[key] = hasPermission;

    return accum;
  }, {} as Permissions);
}

export function validatePermissions(
  permissions: Partial<Permissions> = {}
): Promise<void> {
  const permissionKeys = Object.keys(permissions);

  if (permissionKeys.length === 0) {
    return Promise.reject(new ValidationError(`No permissions provided.`));
  }

  const unknownKeys = permissionKeys.filter((key) => {
    return !(key in PERMISSIONS);
  });

  if (unknownKeys.length > 0) {
    return Promise.reject(
      new ValidationError(`Unknown permission keys: ${unknownKeys.join(", ")}.`)
    );
  }

  const invalidPermissionValues = permissionKeys.filter((key) => {
    return typeof permissions[key as PermissionKey] !== "boolean";
  });

  if (invalidPermissionValues.length > 0) {
    return Promise.reject(
      new ValidationError(
        `Invalid values for permission keys: ${invalidPermissionValues.join(
          ", "
        )}. Must have a value of true or false.`
      )
    );
  }

  return Promise.resolve();
}

export async function setPermissions(
  userId: string,
  permissions: Partial<Permissions> = {}
): Promise<void> {
  const auth = admin.auth();

  const claims = VALID_PERMISSION_KEYS.reduce((accum, key) => {
    const claimKey = PERMISSIONS[key] as ClaimKey;

    if (permissions[key] === true) {
      accum[claimKey] = 1;
    }

    return accum;
  }, {} as PermissionClaims);

  // if we can set permissions on a user, they must be provisioned
  claims[PERMISSIONS.provisioned] = 1;

  await auth.setCustomUserClaims(userId, claims);
}
