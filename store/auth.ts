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
  signUp(_, { email, password }) {
    return this.$fire.auth.createUserWithEmailAndPassword(email, password);
  },

  signInWithEmail(_, { email, password }) {
    return this.$fire.auth.signInWithEmailAndPassword(email, password);
  },

  signOut() {
    return this.$fire.auth.signOut();
  },
};
