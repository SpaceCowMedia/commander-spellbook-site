import { Middleware } from "@nuxt/types";

const authMiddleware: Middleware = ({ store, route, redirect }) => {
  const isAuthenticated = store.getters["auth/isAuthenticated"];

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
