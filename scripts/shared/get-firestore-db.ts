import connectToFirebase from "@spellbook/frontend/lib/connect-to-firebase";
import firebaseConfig from "../../firebase-config";

export default function getDb() {
  const useEmulators =
    process.env.NODE_ENV === "development" &&
    process.env.USE_FIREBASE_EMULATORS === "true";

  return connectToFirebase(firebaseConfig, useEmulators).db;
}
