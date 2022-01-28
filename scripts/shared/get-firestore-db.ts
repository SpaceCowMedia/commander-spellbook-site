import firebaseConfig from "../../firebase-config";
import connectToFirebase from "frontend/lib/connect-to-firebase";

export default function getDb() {
  const useEmulators =
    process.env.NODE_ENV === "development" &&
    process.env.USE_FIREBASE_EMULATORS === "true";

  return connectToFirebase(firebaseConfig, useEmulators).db;
}
