import { initializeApp, getApps } from "firebase/app";
import {
  connectAuthEmulator,
  getAuth,
  onAuthStateChanged,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signOut,
  updateProfile,
} from "firebase/auth";
import setupFirebase from "~/plugins/firebase";

jest.mock("firebase/auth");
jest.mock("firebase/app");

describe("firebase", () => {
  let fakeAuth: ReturnType<typeof getAuth>;

  beforeEach(() => {
    fakeAuth = {
      name: "fake-auth",
      currentUser: {},
    } as ReturnType<typeof getAuth>;
    jest.mocked(getApps).mockReturnValue([]);
    jest.mocked(getAuth).mockReturnValue(fakeAuth);
  });

  it("initializes firebase app if it is not already initialized", () => {
    setupFirebase(
      {
        // @ts-ignore
        store: {
          commit: jest.fn(),
        },
        env: {
          useEmulators: false,
        },
      },
      jest.fn()
    );

    expect(getApps).toBeCalledTimes(1);
    expect(initializeApp).toBeCalledTimes(1);
  });

  it("skips initialization when firebase is already initialized", () => {
    const fakeFirebase = { fakeFirebase: "app" };
    // @ts-ignore
    jest.mocked(getApps).mockReturnValue([fakeFirebase]);

    setupFirebase(
      {
        // @ts-ignore
        store: {
          commit: jest.fn(),
        },
        env: {
          useEmulators: false,
        },
      },
      jest.fn()
    );

    expect(getApps).toBeCalledTimes(1);
    expect(initializeApp).not.toBeCalled();
    expect(getAuth).toBeCalledWith(fakeFirebase);
  });

  it("injects $fire", () => {
    const spy = jest.fn();

    setupFirebase(
      {
        // @ts-ignore
        store: {
          commit: jest.fn(),
        },
        env: {
          useEmulators: false,
        },
      },
      spy
    );

    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith("fire", expect.any(Object));
  });

  it("connects emulators when configured", () => {
    setupFirebase(
      {
        // @ts-ignore
        store: {
          commit: jest.fn(),
        },
        env: {
          useEmulators: false,
        },
      },
      jest.fn()
    );

    expect(connectAuthEmulator).not.toBeCalled();

    setupFirebase(
      {
        // @ts-ignore
        store: {
          commit: jest.fn(),
        },
        env: {
          useEmulators: true,
        },
      },
      jest.fn()
    );

    expect(connectAuthEmulator).toBeCalledTimes(1);
    expect(connectAuthEmulator).toBeCalledWith(
      fakeAuth,
      "http://localhost:9099"
    );
  });

  it("commits user on auth change", () => {
    const user = {
      email: "rashmi@example.com",
      displayName: "Rashmi, Eternities Crafter",
      isVerified: true,
      refreshToken: "token",
    };
    const commit = jest.fn();
    jest.mocked(onAuthStateChanged).mockImplementation((_, cb) => {
      // @ts-ignore
      cb(user);

      return jest.fn();
    });

    setupFirebase(
      {
        // @ts-ignore
        store: {
          commit,
        },
        env: {
          useEmulators: false,
        },
      },
      jest.fn()
    );

    expect(commit).toBeCalledWith("auth/setUser", user);
  });

  it("updates the local user on auth change", () => {
    const spy = jest.fn();
    const user = {
      email: "rashmi@example.com",
      displayName: "Rashmi, Eternities Crafter",
      isVerified: true,
      refreshToken: "token",
    };
    const commit = jest.fn();
    jest.mocked(onAuthStateChanged).mockImplementation((_, cb) => {
      // @ts-ignore
      cb(user);

      return jest.fn();
    });

    setupFirebase(
      {
        // @ts-ignore
        store: {
          commit,
        },
        env: {
          useEmulators: false,
        },
      },
      spy
    );

    const injectedAuth = spy.mock.calls[0][1].auth;

    expect(injectedAuth.currentUser).toBe(user);
  });

  it("provies firebase auth methods", () => {
    const spy = jest.fn();

    setupFirebase(
      {
        // @ts-ignore
        store: {
          commit: jest.fn(),
        },
        env: {
          useEmulators: false,
        },
      },
      spy
    );

    const injectedAuth = spy.mock.calls[0][1].auth;

    injectedAuth.sendSignInLinkToEmail("email@example.com", {});
    expect(sendSignInLinkToEmail).toBeCalledTimes(1);
    expect(sendSignInLinkToEmail).toBeCalledWith(
      fakeAuth,
      "email@example.com",
      {}
    );

    injectedAuth.isSignInWithEmailLink("www.example.com");
    expect(isSignInWithEmailLink).toBeCalledTimes(1);
    expect(isSignInWithEmailLink).toBeCalledWith(fakeAuth, "www.example.com");

    injectedAuth.signInWithEmailLink("email@example.com", "www.example.com");
    expect(signInWithEmailLink).toBeCalledTimes(1);
    expect(signInWithEmailLink).toBeCalledWith(
      fakeAuth,
      "email@example.com",
      "www.example.com"
    );

    injectedAuth.signOut();
    expect(signOut).toBeCalledTimes(1);
    expect(signOut).toBeCalledWith(fakeAuth);

    const handler = jest.fn();
    injectedAuth.onAuthStateChanged(handler);
    expect(onAuthStateChanged).toBeCalledWith(fakeAuth, handler);
  });

  it("injects updateProfile", async () => {
    expect.assertions(4);

    const spy = jest.fn();

    setupFirebase(
      {
        // @ts-ignore
        store: {
          commit: jest.fn(),
        },
        env: {
          useEmulators: false,
        },
      },
      spy
    );

    const injectedAuth = spy.mock.calls[0][1].auth;

    await injectedAuth.updateProfile({
      displayName: "name",
    });
    expect(updateProfile).toBeCalledTimes(1);
    expect(updateProfile).toBeCalledWith(fakeAuth.currentUser, {
      displayName: "name",
    });

    // @ts-ignore
    fakeAuth.currentUser = null;

    jest.mocked(updateProfile).mockReset();
    try {
      await injectedAuth.updateProfile({
        displayName: "name",
      });
    } catch (e) {
      expect(updateProfile).not.toBeCalled();
      expect(e.message).toBe("Unexpected Error. No user.");
    }
  });
});
