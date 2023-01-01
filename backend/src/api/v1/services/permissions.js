const admin = require("firebase-admin");
const { PERMISSIONS } = require("../../../shared/constants");
const { ValidationError } = require("../../error");

// an array of single character values corresponding to the permissions for a user
const VALID_PERMISSION_KEYS = Object.keys(PERMISSIONS);

function transformClaimsToPermissions(claims) {
  return VALID_PERMISSION_KEYS.reduce((accum, key) => {
    const claimsKey = PERMISSIONS[key];
    const hasPermission = claims[claimsKey] === 1;

    accum[key] = hasPermission;

    return accum;
  }, {});
}

// @returns Promise<UserPermissions>
async function getPermissions(userId) {
  const auth = admin.auth();
  const userRecord = await auth.getUser(userId);
  const claims = userRecord.customClaims || {};

  return transformClaimsToPermissions(claims);
}

// @returns Promise<void>
function validatePermissions(permissions = {}) {
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
    return typeof permissions[key] !== "boolean";
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

function transformPermissionsToClaims(permissions) {
  return VALID_PERMISSION_KEYS.reduce((accum, key) => {
    const claimKey = PERMISSIONS[key];

    if (permissions[key] === true) {
      accum[claimKey] = 1;
    }

    return accum;
  }, {});
}

// @returns Promise<void>
async function setPermissions(userId, permissions = {}) {
  const auth = admin.auth();

  const claims = transformPermissionsToClaims(permissions);

  // if we can set permissions on a user, they must be provisioned
  claims[PERMISSIONS.provisioned] = 1;

  await auth.setCustomUserClaims(userId, claims);
}

module.exports = {
  transformClaimsToPermissions,
  getPermissions,
  validatePermissions,
  transformPermissionsToClaims,
  setPermissions,
};
