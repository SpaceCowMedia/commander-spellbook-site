import flushPromises from "flush-promises";
import { state, getters, mutations, actions } from "~/store/auth";
import { PERMISSIONS } from "~/lib/constants";

describe("Auth Store", () => {
  describe("getters", () => {
    describe("isAuthenticated", () => {
      it("is true when there is an email token", () => {
        const s = state();
        s.user.email = "email@example.com";

        const isAuthenticated = getters.isAuthenticated(s, null, {}, null);

        expect(isAuthenticated).toBe(true);
      });

      it("is false when there is not an email", () => {
        const s = state();
        s.user.email = "";

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
          provisioned: true,
        });

        expect(s.user.email).toBe("user@example.com");
        expect(s.user.displayName).toBe("First Last");
        expect(s.user.provisioned).toBe(true);
      });

      it("resets to empty user object when no user data is passed", () => {
        const s = state();
        s.user.email = "user@example.com";
        s.user.displayName = "First Last";
        s.user.provisioned = true;

        mutations.setUser(s, null);

        expect(s.user.email).toBe("");
        expect(s.user.displayName).toBe("");
        expect(s.user.provisioned).toBe(false);
      });
    });

    it("ignores provisioned attribute if not passed", () => {
      const s = state();
      s.user.provisioned = true;

      mutations.setUser(s, {
        email: "user@example.com",
        displayName: "First Last",
      });

      expect(s.user.email).toBe("user@example.com");
      expect(s.user.displayName).toBe("First Last");
      expect(s.user.provisioned).toBe(true);
    });
  });

  // TODO why do all these actions need to be cast as Function?
  describe("actions", () => {
    let auth: {
      isSignInWithEmailLink: jest.SpyInstance;
      sendSignInLinkToEmail: jest.SpyInstance;
      signInWithEmailLink: jest.SpyInstance;
      signOut: jest.SpyInstance;
      onAuthStateChanged: jest.SpyInstance;
      currentUser?: {
        updateProfile: jest.SpyInstance;
      };
    };

    beforeEach(() => {
      auth = {
        isSignInWithEmailLink: jest.fn().mockReturnValue(true),
        sendSignInLinkToEmail: jest.fn(),
        signInWithEmailLink: jest.fn().mockResolvedValue({
          additionalUserInfo: {
            isNewUser: false,
          },
        }),
        onAuthStateChanged: jest.fn().mockImplementation((cb) => {
          setTimeout(cb, 1);
          return jest.fn();
        }),
        signOut: jest.fn(),
      };
      (actions as any).$fire = {
        auth,
      };
      (actions as any).commit = jest.fn();
      (actions as any).dispatch = jest.fn().mockResolvedValue({});
    });

    describe("requestMagicLink", () => {
      it("calls $fire.auth.sendSignInLinkToEmail", async () => {
        await (actions.requestMagicLink as Function)(null, {
          email: "email@example.com",
        });

        expect(auth.sendSignInLinkToEmail).toBeCalledTimes(1);
        expect(auth.sendSignInLinkToEmail).toBeCalledWith("email@example.com", {
          url: expect.stringMatching("/finish-login/"),
          handleCodeInApp: true,
        });
      });

      it("stores email for sign-in in local storage", async () => {
        await (actions.requestMagicLink as Function)(null, {
          email: "email-in-local-storage@example.com",
        });

        expect(window.localStorage.getItem("emailForSignIn")).toBe(
          "email-in-local-storage@example.com"
        );
      });

      it("stores display name for initial sign up flow", async () => {
        await (actions.requestMagicLink as Function)(null, {
          email: "email-in-local-storage@example.com",
          displayName: "Name Here",
        });

        expect(window.localStorage.getItem("displayNameForSignUp")).toBe(
          "Name Here"
        );
      });
    });

    describe("signInWithMagicLink", () => {
      it("rejects if is not a valid sing in link", async () => {
        expect.assertions(2);

        window.localStorage.setItem("emailForSignIn", "email@example.com");
        auth.isSignInWithEmailLink.mockReturnValue(false);

        try {
          await (actions.signInWithMagicLink as Function)();
        } catch (e) {
          expect(e.message).toBe("Sign in url is not valid");
        }

        expect(auth.isSignInWithEmailLink).toBeCalledWith(window.location.href);
      });

      it("rejects if email is not found in local storage", async () => {
        expect.assertions(1);

        window.localStorage.removeItem("emailForSignIn");

        try {
          await (actions.signInWithMagicLink as Function)();
        } catch (e) {
          expect(e.message).toBe("No email found");
        }
      });

      it("calls $fire.auth.signInWithEmailLink", async () => {
        window.localStorage.setItem("emailForSignIn", "email@example.com");

        await (actions.signInWithMagicLink as Function)();

        expect(auth.signInWithEmailLink).toBeCalledTimes(1);
        expect(auth.signInWithEmailLink).toBeCalledWith(
          "email@example.com",
          window.location.href
        );
      });

      it("removes email from local sorage", async () => {
        window.localStorage.setItem("emailForSignIn", "email@example.com");

        await (actions.signInWithMagicLink as Function)();

        expect(window.localStorage.getItem("emailForSignIn")).toBeFalsy();
      });

      it("updates the current user with a display name if it is a new user and a display name is in local storage", async () => {
        window.localStorage.setItem("emailForSignIn", "email@example.com");
        window.localStorage.setItem("displayNameForSignUp", "Name Here");

        auth.signInWithEmailLink.mockResolvedValue({
          additionalUserInfo: {
            isNewUser: true,
          },
        });
        auth.currentUser = {
          updateProfile: jest.fn().mockResolvedValue(null),
        };

        await (actions.signInWithMagicLink as Function)();

        expect(actions.dispatch).toBeCalledTimes(1);
        expect(actions.dispatch).toBeCalledWith("auth/lookupPermissions");
        expect(auth.currentUser.updateProfile).toBeCalledTimes(1);
        expect(auth.currentUser.updateProfile).toBeCalledWith({
          displayName: "Name Here",
        });
      });

      it("does not update the current user with a display name if it is a new user but a display name is not in local storage", async () => {
        window.localStorage.setItem("emailForSignIn", "email@example.com");

        auth.signInWithEmailLink.mockResolvedValue({
          additionalUserInfo: {
            isNewUser: true,
          },
        });
        auth.currentUser = {
          updateProfile: jest.fn().mockResolvedValue(null),
        };

        await (actions.signInWithMagicLink as Function)();

        expect(auth.currentUser.updateProfile).toBeCalledTimes(0);
      });

      it("does not update the current user with a display name if it is not a new user", async () => {
        window.localStorage.setItem("emailForSignIn", "email@example.com");
        window.localStorage.setItem("displayNameForSignUp", "Name Here");

        auth.signInWithEmailLink.mockResolvedValue({
          additionalUserInfo: {
            isNewUser: false,
          },
        });
        auth.currentUser = {
          updateProfile: jest.fn().mockResolvedValue(null),
        };

        await (actions.signInWithMagicLink as Function)();

        expect(auth.currentUser.updateProfile).toBeCalledTimes(0);
      });
    });

    describe("lookupPermissions", () => {
      it("calls $fire.auth.onAuthStateChanged", async () => {
        await (actions.lookupPermissions as Function)();

        expect(auth.onAuthStateChanged).toBeCalledTimes(1);
      });

      it("unsubscribes form onAuthStateChanged", async () => {
        const unsub = jest.fn();
        auth.onAuthStateChanged.mockImplementation((cb) => {
          setTimeout(cb, 1);
          return unsub;
        });

        await (actions.lookupPermissions as Function)();

        expect(unsub).toBeCalledTimes(1);
      });

      it("resolves with an empty object when no user is available", async () => {
        auth.onAuthStateChanged.mockImplementation((cb) => {
          setTimeout(() => {
            cb();
          }, 1);
          return jest.fn();
        });
        const permissions = await (actions.lookupPermissions as Function)();

        expect(permissions).toEqual({
          proposeCombo: false,
          manageUserPermissions: false,
          viewUsers: false,
        });
      });

      it("waits for user to be provisioned before resolving permissions", async () => {
        jest.useFakeTimers();
        const unprovisionedResult = {
          claims: {},
        };
        const provisionedResult = {
          claims: {
            [PERMISSIONS.provisioned]: 1,
            [PERMISSIONS.proposeCombo]: 1,
          },
        };

        const user = {
          reload: jest.fn().mockResolvedValue({}),
          getIdToken: jest.fn().mockResolvedValue({}),
          getIdTokenResult: jest
            .fn()
            .mockResolvedValueOnce(unprovisionedResult)
            .mockResolvedValueOnce(unprovisionedResult)
            .mockResolvedValueOnce(unprovisionedResult)
            .mockResolvedValueOnce(provisionedResult),
        };

        auth.onAuthStateChanged.mockImplementation((cb) => {
          setTimeout(() => {
            cb(user);
          }, 1);
          return jest.fn();
        });
        const promise = (actions.lookupPermissions as Function)();

        jest.advanceTimersByTime(2100);
        await flushPromises();
        expect(user.getIdToken).toBeCalledTimes(1);
        expect(user.getIdTokenResult).toBeCalledTimes(1);

        jest.advanceTimersByTime(2000);
        await flushPromises();
        expect(user.getIdToken).toBeCalledTimes(2);
        expect(user.getIdTokenResult).toBeCalledTimes(2);

        jest.advanceTimersByTime(2000);
        await flushPromises();
        expect(user.getIdToken).toBeCalledTimes(3);
        expect(user.getIdTokenResult).toBeCalledTimes(3);

        jest.advanceTimersByTime(2000);
        await flushPromises();
        expect(user.getIdToken).toBeCalledTimes(4);
        expect(user.getIdTokenResult).toBeCalledTimes(4);

        jest.advanceTimersByTime(2000);
        await flushPromises();
        expect(user.getIdToken).toBeCalledTimes(4);
        expect(user.getIdTokenResult).toBeCalledTimes(4);

        const permissions = await promise;

        expect(permissions).toEqual({
          proposeCombo: true,
          manageUserPermissions: false,
          viewUsers: false,
        });

        expect(user.reload).toBeCalledTimes(1);
      });

      it("commits user after looking up permissions", async () => {
        jest.useFakeTimers();

        const provisionedResult = {
          claims: {
            [PERMISSIONS.provisioned]: 1,
            [PERMISSIONS.proposeCombo]: 1,
          },
        };

        const user = {
          email: "user@example.com",
          displayName: "display name",
          reload: jest.fn().mockResolvedValue({}),
          getIdToken: jest.fn().mockResolvedValue({}),
          getIdTokenResult: jest.fn().mockResolvedValue(provisionedResult),
        };

        auth.onAuthStateChanged.mockImplementation((cb) => {
          setTimeout(() => {
            cb(user);
          }, 1);
          return jest.fn();
        });
        (actions.lookupPermissions as Function)();

        jest.advanceTimersByTime(2100);
        await flushPromises();
        expect(actions.commit).toBeCalledTimes(1);
        expect(actions.commit).toBeCalledWith("auth/setUser", {
          email: "user@example.com",
          displayName: "display name",
          provisioned: true,
        });
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
