import * as admin from "firebase-admin";
// @ts-ignore
import { plugin as cypressFirebasePlugin } from "cypress-firebase";

require("dotenv").config();

process.env.FIREBASE_AUTH_EMULATOR_HOST =
  process.env.FIREBASE_AUTH_EMULATOR_HOST || "localhost:9099";
process.env.FIRESTORE_EMULATOR_HOST =
  process.env.FIRESTORE_EMULATOR_HOST || "localhost:8080";

module.exports = (on, config) => {
  const extendedConfig = cypressFirebasePlugin(on, config, admin);

  return extendedConfig;
};
