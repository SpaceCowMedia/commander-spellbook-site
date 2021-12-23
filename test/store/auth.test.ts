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
        displayName?: string;
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

        expect(window.localStorage.getItem("displayNameForSignUp")).toBeFalsy();
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

        expect(actions.dispatch).toBeCalledTimes(0);
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

        expect(actions.dispatch).toBeCalledTimes(0);
        expect(auth.currentUser.updateProfile).toBeCalledTimes(0);
        expect(window.localStorage.getItem("displayNameForSignUp")).toBeFalsy();
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

      it("resolves with user permissions when use is available", async () => {
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
        const permissions = await (actions.lookupPermissions as Function)();

        expect(permissions).toEqual({
          proposeCombo: true,
          manageUserPermissions: false,
          viewUsers: false,
        });
      });

      it("commits user after looking up permissions", async () => {
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
        await (actions.lookupPermissions as Function)();

        expect(actions.commit).toBeCalledTimes(1);
        expect(actions.commit).toBeCalledWith("auth/setUser", {
          email: "user@example.com",
          displayName: "display name",
          provisioned: true,
        });
      });
    });

    describe("updateProfile", () => {
      beforeEach(() => {
        auth.currentUser = {
          displayName: "Old Name",
          updateProfile: jest.fn().mockResolvedValue(null),
        };
      });

      it("errors when there is no logged in user", async () => {
        expect.assertions(1);

        delete auth.currentUser;

        try {
          await (actions.updateProfile as Function)(null, {
            displayName: "New Name",
          });
        } catch (err) {
          expect(err.message).toBe("No user logged in.");
        }
      });

      it("errors when no updates are passed", async () => {
        expect.assertions(1);

        try {
          await (actions.updateProfile as Function)(null, {
            displayName: "",
          });
        } catch (err) {
          expect(err.message).toBe("Nothing set to update.");
        }
      });

      it("errors when nothing was changed", async () => {
        expect.assertions(1);

        try {
          await (actions.updateProfile as Function)(null, {
            displayName: "Old Name",
          });
        } catch (err) {
          expect(err.message).toBe("Nothing set to update.");
        }
      });

      it("updates the display name", async () => {
        await (actions.updateProfile as Function)(null, {
          displayName: "New Name",
        });

        expect(auth.currentUser?.updateProfile).toBeCalledTimes(1);
        expect(auth.currentUser?.updateProfile).toBeCalledWith({
          displayName: "New Name",
        });
      });

      it("commits updates to user store", async () => {
        await (actions.updateProfile as Function)(null, {
          displayName: "New Name",
        });

        expect(actions.commit).toBeCalledTimes(1);
        expect(actions.commit).toBeCalledWith("auth/setUser", auth.currentUser);
      });
    });

    describe("signOut", () => {
      it("calls $fire.auth.signInWithEmailAndPassword", () => {
        (actions.signOut as Function)();

        expect(auth.signOut).toBeCalledTimes(1);
      });

      it("resets the user", () => {
        (actions.signOut as Function)();

        expect(actions.commit).toBeCalledTimes(1);
        expect(actions.commit).toBeCalledWith("auth/setUser", null);
      });
    });
  });
});
