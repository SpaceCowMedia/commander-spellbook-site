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
    const displayName = window.localStorage.getItem("displayNameForSignUp");

    if (!email) {
      // TODO maybe pop up a modal to enter email insteaad?
      return Promise.reject(new Error("No email found"));
    }

    const userResult = await this.$fire.auth.signInWithEmailLink(
      email,
      window.location.href
    );

    window.localStorage.removeItem("emailForSignIn");

    if (displayName && userResult.additionalUserInfo?.isNewUser) {
      await this.$fire.auth.currentUser?.updateProfile({
        displayName,
      });
      window.localStorage.removeItem("displayNameForSignUp");
    }
  },

  signOut(): Promise<void> {
    return this.$fire.auth.signOut();
  },
};
