import admin from "firebase-admin";
import type { Request, Response } from "express";
import UserProfile from "../../../db/user-profile";
import Username from "../../../db/username";
import { PERMISSIONS } from "../../../shared/constants";

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

  if (/[^a-z0-9_]/i.test(username)) {
    res.status(400).json({
      message: "Username must only have alphanumeric characters or _.",
    });
    return;
  }

  if (permissions.provisioned) {
    res.status(400).json({
      message: "User is already provisioned.",
    });
    return;
  }

  // TODO, may not need to do this! Are we ok with just overwriting
  // a user profile if it already exists? Shouldn't be a problem,
  // since it should only create a profile when the user is first provisioned
  const existingUserProfileExists = await UserProfile.exists(userId);
  if (existingUserProfileExists) {
    res.status(400).json({
      message: `User Profile for user with id "${userId}" already exists`,
    });
    return;
  }

  const normalizedUsername = username.toLowerCase();
  const usernameTaken = await Username.exists(normalizedUsername);
  if (usernameTaken) {
    res.status(400).json({
      message: `"${username}" is not an available username.`,
    });
    return;
  }

  await Promise.all([
    Username.createWithId(normalizedUsername, {
      userId,
    }),
    UserProfile.createWithId(userId, {
      username,
    }),
  ]);

  const auth = admin.auth();

  await auth.updateUser(userId, {
    displayName: username,
  });
  await auth.setCustomUserClaims(userId, {
    [PERMISSIONS.provisioned]: 1,
    [PERMISSIONS.proposeCombo]: 1,
  });

  res.status(201).json({
    permissions: {
      proposeCombo: true,
    },
    username,
  });
}
