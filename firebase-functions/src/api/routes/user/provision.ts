import type { Request, Response } from "express";
import UserProfile from "../../../db/user-profile";
import Username from "../../../db/username";

export default async function provision(req: Request, res: Response) {
  const username = req.body.username?.trim();

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

  if (req.userPermissions.provisioned) {
    res.status(400).json({
      message: "User is already provisioned.",
    });
    return;
  }

  const existingUserProfileExists = await UserProfile.exists(req.userId);
  if (existingUserProfileExists) {
    res.status(400).json({
      message: `User Profile for user with id "${req.userId}" already exists`,
    });
    return;
  }

  // TODO transform username casing
  const usernameTaken = await Username.exists(username);
  if (usernameTaken) {
    res.status(400).json({
      message: `"${username}" is not an available username.`,
    });
    return;
  }

  // TODO create username (maybe can do this as a 1 and done since setting it should error if it already exists?) doc, with user id as the key
  // TODO create user-profiles doc and set username in it
  // TODO set provisioned to true
  // TODO set proposeCombo to true
  res.status(201).json({});
}
