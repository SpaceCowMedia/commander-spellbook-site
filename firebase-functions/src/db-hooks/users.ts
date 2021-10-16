import admin from "firebase-admin";
import { auth } from "firebase-functions";
import generateRandomName from "../lib/generate-random-name";

export const onUserCreate = auth.user().onCreate(async (user) => {
  const uid = user.uid;
  const auth = admin.auth();

  await auth.updateUser(uid, {
    displayName: generateRandomName(),
  });
  await auth.setCustomUserClaims(uid, {
    provisioned: true,
    proposeCombo: true,
  });
});
