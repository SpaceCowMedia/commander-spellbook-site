import {
  getAuth,
  onAuthStateChanged,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signOut,
  updateProfile,
} from "firebase/auth";
import connectToFirebase from "~/lib/connect-to-firebase";
import setupFirebase from "~/plugins/firebase";

jest.mock("firebase/auth");
jest.mock("~/lib/connect-to-firebase");

describe("firebase", () => {
  let fakeAuth: ReturnType<typeof getAuth>;
  let env: Record<string, string | boolean>;

  beforeEach(() => {
    env = {
      FIREBASE_API_KEY: "api-key",
      FIREBASE_AUTH_DOMAIN: "auth-domain",
      FIREBASE_PROJECT_ID: "project-id",
      FIREBASE_STORAGE_BUCKET: "storage-bucket",
      FIREBASE_MESSAGING_SENDER_ID: "messaging-sender-id",
      FIREBASE_APP_ID: "app-id",
      useEmulators: false,
    };
    fakeAuth = {
      name: "fake-auth",
      currentUser: {},
    } as ReturnType<typeof getAuth>;
    jest.mocked(getAuth).mockReturnValue(fakeAuth);
    jest.mocked(connectToFirebase).mockReturnValue({
      db: {},
      auth: fakeAuth,
    } as ReturnType<typeof connectToFirebase>);
  });

  it("connects to firebase", () => {
    setupFirebase(
      {
        // @ts-ignore
        store: {
          commit: jest.fn(),
        },
        env,
      },
      jest.fn()
    );

    expect(connectToFirebase).toBeCalledTimes(1);
    expect(connectToFirebase).toBeCalledWith(
      {
        apiKey: "api-key",
        authDomain: "auth-domain",
        projectId: "project-id",
        storageBucket: "storage-bucket",
        messagingSenderId: "messaging-sender-id",
        appId: "app-id",
      },
      false
    );
  });

  it("passes along useEmulators value when connecting to firebase", () => {
    env.useEmulators = true;

    setupFirebase(
      {
        // @ts-ignore
        store: {
          commit: jest.fn(),
        },
        env,
      },
      jest.fn()
    );

    expect(connectToFirebase).toBeCalledTimes(1);
    expect(connectToFirebase).toBeCalledWith(
      {
        apiKey: "api-key",
        authDomain: "auth-domain",
        projectId: "project-id",
        storageBucket: "storage-bucket",
        messagingSenderId: "messaging-sender-id",
        appId: "app-id",
      },
      true
    );
  });

  it("injects $fire", () => {
    const spy = jest.fn();

    setupFirebase(
      {
        // @ts-ignore
        store: {
          commit: jest.fn(),
        },
        env,
      },
      spy
    );

    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith("fire", expect.any(Object));
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
        env,
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
        env,
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
        env,
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
        env,
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

    await expect(
      injectedAuth.updateProfile({
        displayName: "name",
      })
    ).rejects.toEqual(new Error("Unexpected Error. No user."));
    expect(updateProfile).not.toBeCalled();
  });
});
