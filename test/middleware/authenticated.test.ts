import { createRoute, createStore, createFirebase } from "../utils";
import authMiddleware from "~/middleware/authenticated";

describe("authMiddleware", () => {
  let $fire: ReturnType<typeof createFirebase>;
  let store: ReturnType<typeof createStore>;
  let route: ReturnType<typeof createRoute>;
  let redirect: jest.SpyInstance;

  beforeEach(() => {
    store = createStore();
    route = createRoute();
    $fire = createFirebase();
    redirect = jest.fn();
  });

  it("noops if route does not need auth handling", () => {
    // @ts-ignore
    authMiddleware({
      store,
      route,
      $fire,
      redirect,
    });

    expect(redirect).not.toBeCalled();
  });

  it("signs the user out when the signout route is used", async () => {
    route = createRoute({
      path: "/signout/",
    });

    // @ts-ignore
    await authMiddleware({
      store,
      route,
      redirect,
      $fire,
    });

    expect(store.dispatch).toBeCalledTimes(1);
    expect(store.dispatch).toBeCalledWith("auth/signOut");
    expect(redirect).toBeCalledTimes(1);
    expect(redirect).toBeCalledWith("/");
  });

  it("signs in with magic link when finish-login route is used", async () => {
    route = createRoute({
      path: "/finish-login/",
    });

    // @ts-ignore
    await authMiddleware({
      store,
      route,
      redirect,
      $fire,
    });

    expect(store.dispatch).toBeCalledTimes(1);
    expect(store.dispatch).toBeCalledWith("auth/signInWithMagicLink");
    expect(redirect).toBeCalledTimes(1);
    expect(redirect).toBeCalledWith("/profile/");
  });

  it.each(["/profile/"])(
    "noops if %s route requires authentication and user is authenticated",
    (path) => {
      route = createRoute({
        path,
      });

      // @ts-ignore
      authMiddleware({
        store,
        route,
        redirect,
        $fire,
      });

      expect(redirect).not.toBeCalled();
    }
  );

  it.each(["/profile/"])(
    "reidrects if %s route requires authentication and user is not authenticated",
    (path) => {
      delete $fire.auth.currentUser;
      route = createRoute({
        path,
      });

      // @ts-ignore
      authMiddleware({
        store,
        route,
        redirect,
        $fire,
      });

      expect(redirect).toBeCalledTimes(1);
      expect(redirect).toBeCalledWith("/login/");
    }
  );

  it.each(["/login/", "/sign-up"])(
    "noops if %s route should be skipped if logged in, but user is not authenticated",
    (path) => {
      delete $fire.auth.currentUser;
      route = createRoute({
        path,
      });

      // @ts-ignore
      authMiddleware({
        store,
        route,
        redirect,
        $fire,
      });

      expect(redirect).not.toBeCalled();
    }
  );

  it.each(["/login/", "/sign-up"])(
    "reidrects if %s route should be skipped when user is logged in",
    (path) => {
      route = createRoute({
        path,
      });

      // @ts-ignore
      authMiddleware({
        store,
        route,
        redirect,
        $fire,
      });

      expect(redirect).toBeCalledTimes(1);
      expect(redirect).toBeCalledWith("/profile/");
    }
  );
});
