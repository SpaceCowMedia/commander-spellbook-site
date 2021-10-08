import type { GetterTree, ActionTree, MutationTree } from "vuex";
import type { RootState } from "./";

function createEmptyUser() {
  return {
    email: "",
    displayName: "",
    emailVerified: false,
    refreshToken: "",
  };
}

export const state = () => ({
  user: createEmptyUser(),
});

export type AuthState = ReturnType<typeof state>;

export const getters: GetterTree<AuthState, RootState> = {
  user: (state) => state.user,
  isAuthenticated: (state) => Boolean(state.user.refreshToken),
};

export const mutations: MutationTree<AuthState> = {
  setUser(state, userData: ReturnType<typeof createEmptyUser>) {
    if (!userData) {
      state.user = createEmptyUser();
      return;
    }

    state.user.email = userData.email;
    state.user.displayName = userData.displayName;
    state.user.emailVerified = Boolean(userData.emailVerified);
    state.user.refreshToken = userData.refreshToken;
  },
};

export const actions: ActionTree<AuthState, RootState> = {
  async requestMagicLink(_, { email, displayName }): Promise<void> {
    await this.$fire.auth.sendSignInLinkToEmail(email, {
      url: `${window.location.origin}/finish-login/`,
      handleCodeInApp: true,
    });

    window.localStorage.setItem("emailForSignIn", email);
    window.localStorage.setItem("displayNameForSignUp", displayName);
  },

  async signInWithMagicLink(): Promise<void> {
    if (!this.$fire.auth.isSignInWithEmailLink(window.location.href)) {
      return Promise.reject(new Error("Sign in url is not valid"));
    }

    const email = window.localStorage.getItem("emailForSignIn");
    // TODO
    // const username = (window.localStorage.getItem("username") || "").trim();
    // const isInitialSignup =
    //   window.localStorage.getItem("isInitialSignup") === "true";

    if (!email) {
      // TODO maybe pop up a modal to enter email insteaad?
      return Promise.reject(new Error("No email found"));
    }

    await this.$fire.auth.signInWithEmailLink(email, window.location.href);
    // Clear email from storage.
    window.localStorage.removeItem("emailForSignIn");
    // TODO
    // window.localStorage.removeItem("username");
    // window.localStorage.removeItem("isInitialSignup");

    // TODO
    // if (isInitialSignup && username && this.$fire.auth.currentUser) {
    //   console.log("heyou");
    // }
    // You can access the new user via result.user
    // Additional user info profile not available via:
    // result.additionalUserInfo.profile == null
    // You can check if the user is new or existing:
    // result.additionalUserInfo.isNewUser
  },

  signOut(): Promise<void> {
    return this.$fire.auth.signOut();
  },
};
