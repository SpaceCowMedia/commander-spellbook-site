import { Middleware } from "@nuxt/types";

const authMiddleware: Middleware = ({ store, route, redirect, $fire }) => {
  const isAuthenticated = Boolean($fire.auth.currentUser);

  if (route.path.includes("/signout")) {
    return store.dispatch("auth/signOut").then(() => {
      redirect("/");
    });
  }

  if (route.path.includes("/finish-login")) {
    return store.dispatch("auth/signInWithMagicLink").then(() => {
      redirect("/profile/");
    });
  }

  if (requiresAuth(route) && !isAuthenticated) {
    redirect("/login/");
    return;
  }

  if (skipIfLoggedIn(route) && isAuthenticated) {
    redirect("/profile/");
  }
};

function requiresAuth({ path }: { path: string }) {
  return path.includes("/profile");
}

function skipIfLoggedIn({ path }: { path: string }) {
  return path.includes("/login") || path.includes("/sign-up");
}

export default authMiddleware;
