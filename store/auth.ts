import type { GetterTree, ActionTree, MutationTree } from "vuex";
import { PERMISSIONS } from "@/lib/constants";
import type { RootState } from "./";

type Permissions = {
  proposeCombo: boolean;
  manageUserPermissions: boolean;
  viewUsers: boolean;
};

function createEmptyUser() {
  return {
    email: "",
    displayName: "",
    provisioned: false,
  };
}

export const state = () => ({
  user: createEmptyUser(),
});

export type AuthState = ReturnType<typeof state>;

export const getters: GetterTree<AuthState, RootState> = {
  user: (state) => state.user,
  isAuthenticated: (state) => Boolean(state.user.email),
  isProvisioned: (state) => Boolean(state.user.provisioned),
};

export const mutations: MutationTree<AuthState> = {
  setUser(state, userData: ReturnType<typeof createEmptyUser>) {
    if (!userData) {
      state.user = createEmptyUser();
      return;
    }

    state.user.email = userData.email;
    state.user.displayName = userData.displayName;

    if (userData.provisioned) {
      state.user.provisioned = true;
    }
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
      // need to wait till User is provisioned before we update
      // the display name, otherwise it'll be overwritten during
      // the provision staged with the random default display name
      await this.dispatch("auth/lookupPermissions");
      await this.$fire.auth.currentUser?.updateProfile({
        displayName,
      });
    }
    window.localStorage.removeItem("displayNameForSignUp");
  },

  lookupPermissions(): Promise<Permissions> {
    return new Promise((resolve) => {
      const unsubscribe = this.$fire.auth.onAuthStateChanged(async (user) => {
        unsubscribe();

        if (!user) {
          resolve({
            proposeCombo: false,
            manageUserPermissions: false,
            viewUsers: false,
          });
          return;
        }

        await user.getIdToken(true);
        const token = await user.getIdTokenResult();
        const provisioned = token.claims[PERMISSIONS.provisioned] === 1;

        this.commit("auth/setUser", {
          email: user.email,
          displayName: user.displayName,
          provisioned,
        });

        resolve({
          proposeCombo: token.claims[PERMISSIONS.proposeCombo] === 1,
          manageUserPermissions:
            token.claims[PERMISSIONS.manageUserPermissions] === 1,
          viewUsers: token.claims[PERMISSIONS.viewUsers] === 1,
        });
      });
    });
  },

  async updateProfile(_, { displayName }): Promise<void> {
    let numberOfUpdates = 0;
    const user = this.$fire.auth.currentUser;

    if (!user) {
      return Promise.reject(new Error("No user logged in."));
    }

    const promises = [] as Promise<unknown>[];

    if (displayName && user.displayName !== displayName) {
      numberOfUpdates++;
      promises.push(
        user.updateProfile({
          displayName,
        })
      );
    }

    // TODO add any additional profile info here

    if (numberOfUpdates === 0) {
      return Promise.reject(new Error("Nothing set to update."));
    }

    await Promise.all(promises);
    await this.commit("auth/setUser", user);
  },

  signOut(): Promise<void> {
    this.commit("auth/setUser", null);
    return this.$fire.auth.signOut();
  },
};
