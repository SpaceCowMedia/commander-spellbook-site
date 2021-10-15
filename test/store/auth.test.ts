import { actions } from "~/store/auth";

describe("Auth Store", () => {
  // TODO why do all these actions need to be cast as Function?
  describe("actions", () => {
    let auth: {
      isSignInWithEmailLink: jest.SpyInstance;
      sendSignInLinkToEmail: jest.SpyInstance;
      signInWithEmailLink: jest.SpyInstance;
      signOut: jest.SpyInstance;
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
        signOut: jest.fn(),
      };
      (actions as any).$fire = {
        auth,
      };
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

    describe("signOut", () => {
      it("calls $fire.auth.signInWithEmailAndPassword", () => {
        (actions.signOut as Function)();

        expect(auth.signOut).toBeCalledTimes(1);
      });
    });
  });
});
