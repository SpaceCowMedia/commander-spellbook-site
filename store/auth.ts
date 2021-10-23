import type { GetterTree, ActionTree, MutationTree } from "vuex";
import { PERMISSIONS } from "@/lib/constants";
import type { RootState } from "./";

type Permissions = {
  proposeCombo: boolean;
  manageUserPermissions: boolean;
  viewUsers: boolean;
};

const DELAY_BETWEEN_PROVISION_CHECK = 2000;

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

  lookupPermissions(): Promise<Permissions> {
    return new Promise((resolve) => {
      const unsubscribe = this.$fire.auth.onAuthStateChanged((user) => {
        unsubscribe();

        if (!user) {
          resolve({
            proposeCombo: false,
            manageUserPermissions: false,
            viewUsers: false,
          });
          return;
        }

        const waitForProvision = async (): Promise<Permissions> => {
          // have to do this to refresh the token so the claims are up to date
          await user.getIdToken(true);
          const token = await user.getIdTokenResult();

          if (token.claims[PERMISSIONS.provisioned]) {
            return Promise.resolve({
              proposeCombo: token.claims[PERMISSIONS.proposeCombo] === 1,
              manageUserPermissions:
                token.claims[PERMISSIONS.manageUserPermissions] === 1,
              viewUsers: token.claims[PERMISSIONS.viewUsers] === 1,
            });
          }

          return new Promise((resolve) => {
            setTimeout(() => {
              waitForProvision().then(resolve);
            }, DELAY_BETWEEN_PROVISION_CHECK);
          });
        };

        return waitForProvision()
          .then((per) => {
            return user.reload().then(() => {
              this.commit("auth/setUser", user);
              return per;
            });
          })
          .then(resolve);
      });
    });
  },

  signOut(): Promise<void> {
    return this.$fire.auth.signOut();
  },
};
