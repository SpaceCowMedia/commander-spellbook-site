import { Middleware } from "@nuxt/types";

const authMiddleware: Middleware = ({ store, route, redirect }) => {
  if (process.server) {
    return;
  }

  const isAuthenticated = store.getters["auth/isAuthenticated"];

  if (route.path.includes("/signout")) {
    return store.dispatch("auth/signOut").then(() => {
      redirect("/");
    });
  }

  if (route.path.includes("/finish-login")) {
    return store.dispatch("auth/signInWithMagicLink").then(() => {
      redirect("/dashboard/");
    });
  }

  if (skipIfLoggedIn(route) && isAuthenticated) {
    redirect("/dashboard/");
  }
};

function skipIfLoggedIn({ path }: { path: string }) {
  return path.includes("/login") || path.includes("/sign-up");
}

export default authMiddleware;
