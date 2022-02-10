import { initializeApp, getApps, deleteApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { connectAuthEmulator, getAuth } from "firebase/auth";

export default function connectToFirebase(
  firebaseConfig: Parameters<typeof initializeApp>[0],
  useEmulators = false
) {
  let firebaseApp: ReturnType<typeof initializeApp>;
  let isInitialInit = true;

  const apps = getApps();

  if (apps.length === 0) {
    firebaseApp = initializeApp({
      apiKey: firebaseConfig.apiKey,
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket,
      messagingSenderId: firebaseConfig.messagingSenderId,
      appId: firebaseConfig.appId,
    });
  } else {
    isInitialInit = false;
    firebaseApp = apps[0];
  }

  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);

  if (useEmulators && isInitialInit) {
    connectFirestoreEmulator(db, "localhost", 8080);
    connectAuthEmulator(auth, "http://localhost:9099");
  }

  return {
    auth,
    db,
    teardownFirebase() {
      deleteApp(firebaseApp);
    },
  };
}
