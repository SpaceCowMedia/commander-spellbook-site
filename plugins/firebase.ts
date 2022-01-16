import {
  getAuth,
  onAuthStateChanged,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";
import type { Plugin } from "@nuxt/types";
import connectToFirebase from "../lib/connect-to-firebase";

type NuxtAuth = {
  sendSignInLinkToEmail(
    email: Parameters<typeof sendSignInLinkToEmail>[1],
    actionCodeSettings: Parameters<typeof sendSignInLinkToEmail>[2]
  ): ReturnType<typeof sendSignInLinkToEmail>;
  isSignInWithEmailLink(
    href: Parameters<typeof isSignInWithEmailLink>[1]
  ): ReturnType<typeof isSignInWithEmailLink>;
  signInWithEmailLink(
    email: Parameters<typeof signInWithEmailLink>[1],
    href: Parameters<typeof signInWithEmailLink>[2]
  ): ReturnType<typeof signInWithEmailLink>;
  onAuthStateChanged(
    handler: Parameters<typeof onAuthStateChanged>[1]
  ): ReturnType<typeof onAuthStateChanged>;
  signOut(): ReturnType<typeof signOut>;
  updateProfile(
    updates: Parameters<typeof updateProfile>[1]
  ): ReturnType<typeof updateProfile>;
  currentUser: ReturnType<typeof getAuth>["currentUser"];
};
type NuxtFirestore = {
  getDoc(collection: string, id: string): Promise<DocumentData>;
};

type NuxtFire = {
  auth: NuxtAuth;
  firestore: NuxtFirestore;
};

declare module "vue/types/vue" {
  interface Vue {
    $fire: NuxtFire;
  }
}
declare module "vuex/types/index" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Store<S> {
    $fire: NuxtFire;
  }
}
declare module "@nuxt/types" {
  interface NuxtAppOptions {
    $fire: NuxtFire;
  }
  interface Context {
    $fire: NuxtFire;
  }
}

const firebasePlugin: Plugin = ({ store, env }, inject): void => {
  const { auth, db } = connectToFirebase(
    {
      apiKey: env.FIREBASE_API_KEY,
      authDomain: env.FIREBASE_AUTH_DOMAIN,
      projectId: env.FIREBASE_PROJECT_ID,
      storageBucket: env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
      appId: env.FIREBASE_APP_ID,
    },
    env.useEmulators
  );

  const injectedAuth: NuxtAuth = {
    sendSignInLinkToEmail(email, actionCodeSettings) {
      return sendSignInLinkToEmail(auth, email, actionCodeSettings);
    },
    isSignInWithEmailLink(href) {
      return isSignInWithEmailLink(auth, href);
    },
    signInWithEmailLink(email, href) {
      return signInWithEmailLink(auth, email, href);
    },
    onAuthStateChanged(handler) {
      return onAuthStateChanged(auth, handler);
    },
    signOut() {
      return signOut(auth);
    },
    updateProfile(updates) {
      if (!auth.currentUser) {
        return Promise.reject(new Error("Unexpected Error. No user."));
      }
      return updateProfile(auth.currentUser, updates);
    },
    currentUser: auth.currentUser,
  };

  const injectedFirestore = {
    async getDoc(collection: string, id: string): Promise<DocumentData> {
      const docRef = doc(db, collection, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error("Document not found.");
      }

      return docSnap.data();
    },
  };

  onAuthStateChanged(auth, (user) => {
    store.commit("auth/setUser", user);
    injectedAuth.currentUser = user;
  });

  inject("fire", {
    auth: injectedAuth,
    firestore: injectedFirestore,
  });
};

export default firebasePlugin;
