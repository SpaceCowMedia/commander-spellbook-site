import { state, getters, mutations, actions } from "@/store/auth";
import { PERMISSIONS } from "@/lib/constants";

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
      updateProfile: jest.SpyInstance;
      currentUser?: {
        displayName?: string;
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
        updateProfile: jest.fn(),
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

        await expect(
          (actions.signInWithMagicLink as Function)()
        ).rejects.toEqual(new Error("Sign in url is not valid"));

        expect(auth.isSignInWithEmailLink).toBeCalledWith(window.location.href);
      });

      it("rejects if email is not found in local storage", async () => {
        expect.assertions(1);

        window.localStorage.removeItem("emailForSignIn");

        await expect(
          (actions.signInWithMagicLink as Function)()
        ).rejects.toEqual(new Error("No email found"));
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
    });

    describe("lookupUser", () => {
      it("calls $fire.auth.onAuthStateChanged", async () => {
        await (actions.lookupUser as Function)();

        expect(auth.onAuthStateChanged).toBeCalledTimes(1);
      });

      it("unsubscribes form onAuthStateChanged", async () => {
        const unsub = jest.fn();
        auth.onAuthStateChanged.mockImplementation((cb) => {
          setTimeout(cb, 1);
          return unsub;
        });

        await (actions.lookupUser as Function)();

        expect(unsub).toBeCalledTimes(1);
      });
    });

    describe("lookupPermissions", () => {
      it("resolves with an empty object when no user is available", async () => {
        const dispatch = jest.mocked(actions.dispatch) as jest.SpyInstance;
        dispatch.mockResolvedValue(null);

        const permissions = await (actions.lookupPermissions as Function)();

        expect(permissions).toEqual({
          proposeCombo: false,
          manageUsers: false,
          manageSiteContent: false,
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

        const dispatch = jest.mocked(actions.dispatch) as jest.SpyInstance;
        dispatch.mockResolvedValue(user);

        const permissions = await (actions.lookupPermissions as Function)();

        expect(permissions).toEqual({
          proposeCombo: true,
          manageUsers: false,
          manageSiteContent: false,
          viewUsers: false,
        });
      });

      it("reloads the user when the display name is not immediately available", async () => {
        const provisionedResult = {
          claims: {
            [PERMISSIONS.provisioned]: 1,
            [PERMISSIONS.proposeCombo]: 1,
          },
        };

        const user = {
          email: "user@example.com",
          reload: jest.fn().mockResolvedValue({}),
          getIdToken: jest.fn().mockResolvedValue({}),
          getIdTokenResult: jest.fn().mockResolvedValue(provisionedResult),
        };

        const dispatch = jest.mocked(actions.dispatch) as jest.SpyInstance;
        dispatch.mockResolvedValue(user);

        await (actions.lookupPermissions as Function)();

        expect(user.reload).toBeCalledTimes(1);
      });

      it("does not reload the user when the display name is available", async () => {
        const provisionedResult = {
          claims: {
            [PERMISSIONS.provisioned]: 1,
            [PERMISSIONS.proposeCombo]: 1,
          },
        };

        const user = {
          email: "user@example.com",
          displayName: "Name",
          reload: jest.fn().mockResolvedValue({}),
          getIdToken: jest.fn().mockResolvedValue({}),
          getIdTokenResult: jest.fn().mockResolvedValue(provisionedResult),
        };

        const dispatch = jest.mocked(actions.dispatch) as jest.SpyInstance;
        dispatch.mockResolvedValue(user);

        await (actions.lookupPermissions as Function)();

        expect(user.reload).not.toBeCalled();
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

        const dispatch = jest.mocked(actions.dispatch) as jest.SpyInstance;
        dispatch.mockResolvedValue(user);

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
        };
      });

      it("errors when there is no logged in user", async () => {
        expect.assertions(1);

        delete auth.currentUser;

        await expect(
          (actions.updateProfile as Function)(null, {
            displayName: "New Name",
          })
        ).rejects.toEqual(new Error("No user logged in."));
      });

      it("errors when no updates are passed", async () => {
        expect.assertions(1);

        await expect(
          (actions.updateProfile as Function)(null, {
            displayName: "",
          })
        ).rejects.toEqual(new Error("Nothing set to update."));
      });

      it("errors when nothing was changed", async () => {
        expect.assertions(1);

        await expect(
          (actions.updateProfile as Function)(null, {
            displayName: "Old Name",
          })
        ).rejects.toEqual(new Error("Nothing set to update."));
      });

      it("updates the display name", async () => {
        await (actions.updateProfile as Function)(null, {
          displayName: "New Name",
        });

        expect(auth.updateProfile).toBeCalledTimes(1);
        expect(auth.updateProfile).toBeCalledWith({
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
