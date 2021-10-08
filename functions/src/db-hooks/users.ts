import admin from "firebase-admin";
import { auth } from "firebase-functions";

export const onUserCreate = auth.user().onCreate((user) => {
  return admin.auth().setCustomUserClaims(user.uid, {
    propose_combos: true,
  });
});
