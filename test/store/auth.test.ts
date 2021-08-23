import { state, getters, mutations, actions } from "~/store/auth";

describe("Auth Store", () => {
  describe("getters", () => {
    describe("isAuthenticated", () => {
      it("is true when there is a refresh token", () => {
        const s = state();
        s.user.refreshToken = "token";

        const isAuthenticated = getters.isAuthenticated(s, null, {}, null);

        expect(isAuthenticated).toBe(true);
      });

      it("is false when there is not a refresh token", () => {
        const s = state();
        s.user.refreshToken = "";

        const isAuthenticated = getters.isAuthenticated(s, null, {}, null);

        expect(isAuthenticated).toBe(false);
      });
    });
  });

  describe("mutations", () => {
    describe("setUser", () => {
      it("sets user details", () => {
        const s = state();

        mutations.setUser(s, {
          email: "user@example.com",
          displayName: "First Last",
          emailVerified: true,
          refreshToken: "token",
        });

        expect(s.user.email).toBe("user@example.com");
        expect(s.user.displayName).toBe("First Last");
        expect(s.user.emailVerified).toBe(true);
        expect(s.user.refreshToken).toBe("token");
      });

      it("resets to empty user object when no user data is passed", () => {
        const s = state();
        s.user.email = "user@example.com";
        s.user.displayName = "First Last";
        s.user.emailVerified = true;
        s.user.refreshToken = "token";

        mutations.setUser(s, null);

        expect(s.user.email).toBe("");
        expect(s.user.displayName).toBe("");
        expect(s.user.emailVerified).toBe(false);
        expect(s.user.refreshToken).toBe("");
      });
    });
  });

  describe("actions", () => {
    let auth: {
      createUserWithEmailAndPassword: jest.SpyInstance;
      signInWithEmailAndPassword: jest.SpyInstance;
      signOut: jest.SpyInstance;
    };

    beforeEach(() => {
      auth = {
        createUserWithEmailAndPassword: jest.fn(),
        signInWithEmailAndPassword: jest.fn(),
        signOut: jest.fn(),
      };
      (actions as any).$fire = {
        auth,
      };
    });

    // TODO why do these need to be cast as Function?
    describe("signup", () => {
      it("calls $fire.auth.createUserWithEmailAndPassword", () => {
        (actions.signUp as Function)(null, {
          email: "email@example.com",
          password: "password",
        });

        expect(auth.createUserWithEmailAndPassword).toBeCalledTimes(1);
        expect(auth.createUserWithEmailAndPassword).toBeCalledWith(
          "email@example.com",
          "password"
        );
      });
    });

    describe("signInWithEmail", () => {
      it("calls $fire.auth.signInWithEmailAndPassword", () => {
        (actions.signInWithEmail as Function)(null, {
          email: "email@example.com",
          password: "password",
        });

        expect(auth.signInWithEmailAndPassword).toBeCalledTimes(1);
        expect(auth.signInWithEmailAndPassword).toBeCalledWith(
          "email@example.com",
          "password"
        );
      });
    });

    describe("signOut", () => {
      it("calls $fire.auth.signInWithEmailAndPassword", () => {
        (actions.signOut as Function)();

        expect(auth.signOut).toBeCalledTimes(1);
      });
    });
  });
});
