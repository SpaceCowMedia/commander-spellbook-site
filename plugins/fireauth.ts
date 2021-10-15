import { Plugin } from "@nuxt/types";

const fireauth: Plugin = (nuxt): void => {
  const { store, $fire } = nuxt;

  $fire.auth.onAuthStateChanged((user) => {
    store.commit("auth/setUser", user);
  });
};

export default fireauth;
