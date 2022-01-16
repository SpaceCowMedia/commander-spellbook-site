import {
  getAuth,
  onAuthStateChanged,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signOut,
  updateProfile,
} from "firebase/auth";
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

declare module "vue/types/vue" {
  interface Vue {
    $fire: {
      auth: NuxtAuth;
    };
  }
}
declare module "vuex/types/index" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Store<S> {
    $fire: {
      auth: NuxtAuth;
    };
  }
}
declare module "@nuxt/types" {
  interface NuxtAppOptions {
    $fire: {
      auth: NuxtAuth;
    };
  }
  interface Context {
    $fire: {
      auth: NuxtAuth;
    };
  }
}

const firebasePlugin: Plugin = ({ store, env }, inject): void => {
  const { auth } = connectToFirebase(
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

  onAuthStateChanged(auth, (user) => {
    store.commit("auth/setUser", user);
    injectedAuth.currentUser = user;
  });

  inject("fire", {
    auth: injectedAuth,
  });
};

export default firebasePlugin;
