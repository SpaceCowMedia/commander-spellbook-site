import admin from "firebase-admin";
import { auth } from "firebase-functions";
import generateRandomName from "../util/generate-random-name";
import { PERMISSIONS } from "../util/constants";

export const onUserCreate = auth.user().onCreate(async (user) => {
  const uid = user.uid;
  const auth = admin.auth();

  await auth.updateUser(uid, {
    displayName: generateRandomName(),
  });
  await auth.setCustomUserClaims(uid, {
    [PERMISSIONS.provisioned]: 1,
    [PERMISSIONS.proposeCombo]: 1,
  });
});
