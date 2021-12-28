import admin from "firebase-admin";
import type { Request, Response } from "express";
import UserProfile from "../../../../db/user-profile";
import Username from "../../../../db/username";
import { PERMISSIONS } from "../../../../shared/constants";

export default async function provision(req: Request, res: Response) {
  const username = req.body.username?.trim();
  const userId = req.userId;
  const permissions = req.userPermissions;

  if (!username) {
    res.status(400).json({
      message: "Requires username to provision.",
    });
    return;
  }

  if (permissions.provisioned) {
    res.status(400).json({
      message: "User is already provisioned.",
    });
    return;
  }

  const normalizedUsername = username.toLowerCase().replace(/\s/g, "");

  if (/[^a-z0-9_]/i.test(normalizedUsername)) {
    res.status(400).json({
      message: "Username must only have alphanumeric characters or _.",
    });
    return;
  }

  const usernameTaken = await Username.exists(normalizedUsername);
  if (usernameTaken) {
    res.status(400).json({
      message: `"${username}" is not an available username.`,
    });
    return;
  }

  const auth = admin.auth();

  await Promise.all([
    Username.createWithId(normalizedUsername, {
      userId,
    }),
    UserProfile.createWithId(userId, {
      username,
    }),
    auth.updateUser(userId, {
      displayName: username,
    }),
    auth.setCustomUserClaims(userId, {
      [PERMISSIONS.provisioned]: 1,
      [PERMISSIONS.proposeCombo]: 1,
    }),
  ]);

  res.status(201).json({
    permissions: {
      proposeCombo: true,
    },
    username,
  });
}
