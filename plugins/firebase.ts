import { initializeApp, getApps } from "firebase/app";
import {
  connectAuthEmulator,
  getAuth,
  onAuthStateChanged,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signOut,
  updateProfile,
} from "firebase/auth";
import { Plugin } from "@nuxt/types";
import firebaseConfig from "../firebase-config";

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
  let firebaseApp: ReturnType<typeof initializeApp>;

  const apps = getApps();

  if (apps.length === 0) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = apps[0];
  }

  const auth = getAuth(firebaseApp);
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

  if (env.useEmulators) {
    connectAuthEmulator(auth, "http://localhost:9099");
  }

  onAuthStateChanged(auth, (user) => {
    store.commit("auth/setUser", user);
    injectedAuth.currentUser = user;
  });

  inject("fire", {
    auth: injectedAuth,
  });
};

export default firebasePlugin;
