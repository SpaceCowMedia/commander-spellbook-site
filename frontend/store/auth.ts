import type { User } from "firebase/auth";
import type { GetterTree, ActionTree, MutationTree } from "vuex";
import type { RootState } from "./";
import { PERMISSIONS } from "@/lib/constants";

type Permissions = {
  proposeCombo: boolean;
  manageUsers: boolean;
  viewUsers: boolean;
  manageSiteContent: boolean;
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
    window.localStorage.removeItem("emailForSignIn");

    if (!email) {
      // TODO maybe pop up a modal to enter email insteaad?
      return Promise.reject(new Error("No email found"));
    }

    await this.$fire.auth.signInWithEmailLink(email, window.location.href);
  },

  lookupUser(): Promise<User | null> {
    return new Promise((resolve) => {
      const unsubscribe = this.$fire.auth.onAuthStateChanged((user) => {
        unsubscribe();

        resolve(user);
      });
    });
  },

  async lookupPermissions(): Promise<Permissions> {
    const user = await this.dispatch("auth/lookupUser");

    if (!user) {
      return Promise.resolve({
        proposeCombo: false,
        manageUsers: false,
        manageSiteContent: false,
        viewUsers: false,
      });
    }

    await user.getIdToken(true);
    const token = await user.getIdTokenResult();
    const provisioned = token.claims[PERMISSIONS.provisioned] === 1;

    // when the user is first created, the display name is set
    // on the server, but it doesn't populate automatically,
    // so we need to manually reload the user to get the display
    // name to be available right away
    if (user.displayName == null) {
      await user.reload();
    }

    this.commit("auth/setUser", {
      email: user.email,
      displayName: user.displayName,
      provisioned,
    });

    return Promise.resolve({
      proposeCombo: token.claims[PERMISSIONS.proposeCombo] === 1,
      manageUsers: token.claims[PERMISSIONS.manageUsers] === 1,
      manageSiteContent: token.claims[PERMISSIONS.manageSiteContent] === 1,
      viewUsers: token.claims[PERMISSIONS.viewUsers] === 1,
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
        this.$fire.auth.updateProfile({
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
