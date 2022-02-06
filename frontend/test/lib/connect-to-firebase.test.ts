import { initializeApp, getApps, deleteApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import connectToFirebase from "@/lib/connect-to-firebase";

jest.mock("firebase/app");
jest.mock("firebase/firestore");
jest.mock("firebase/auth");

type Auth = ReturnType<typeof getAuth>;
type Firestore = ReturnType<typeof getFirestore>;

describe("connectToFirebase", () => {
  let fbConfig: Parameters<typeof initializeApp>[0];
  let fakeAuth: Auth;
  let fakeFirestore: Firestore;

  beforeEach(() => {
    fbConfig = {
      apiKey: "api-key",
      authDomain: "auth-domain",
      projectId: "project-id",
      storageBucket: "storage-bucket",
      messagingSenderId: "messaging-sender-id",
      appId: "app-id",
    };

    fakeAuth = {} as Auth;
    fakeFirestore = {} as Firestore;

    jest.mocked(getApps).mockReturnValue([]);
    jest.mocked(getAuth).mockReturnValue(fakeAuth);
    jest.mocked(getFirestore).mockReturnValue(fakeFirestore);
  });

  it("initializes firebase app", () => {
    connectToFirebase(fbConfig);

    expect(initializeApp).toBeCalledTimes(1);
    expect(initializeApp).toBeCalledWith(fbConfig);
  });

  it("does not initialize firebase app if an app is already initialized", () => {
    jest
      .mocked(getApps)
      .mockReturnValue([{} as ReturnType<typeof initializeApp>]);

    connectToFirebase(fbConfig);

    expect(initializeApp).not.toBeCalled();
  });

  it("returns reference to firestore db", () => {
    const { db } = connectToFirebase(fbConfig);

    expect(db).toBe(fakeFirestore);
  });

  it("returns reference to firebase auth", () => {
    const { auth } = connectToFirebase(fbConfig);

    expect(auth).toBe(fakeAuth);
  });

  it("returns function to delete app", () => {
    const { teardownFirebase } = connectToFirebase(fbConfig);

    teardownFirebase();

    expect(deleteApp).toBeCalledTimes(1);
  });

  it("connects to emulators if configured to use them", () => {
    connectToFirebase(fbConfig, true);

    expect(connectFirestoreEmulator).toBeCalledTimes(1);
    expect(connectFirestoreEmulator).toBeCalledWith(
      fakeFirestore,
      "localhost",
      8080
    );
    expect(connectAuthEmulator).toBeCalledTimes(1);
    expect(connectAuthEmulator).toBeCalledWith(
      fakeAuth,
      "http://localhost:9099"
    );
  });

  it("does not connect to emulators if not configured to use them", () => {
    connectToFirebase(fbConfig);

    expect(connectFirestoreEmulator).not.toBeCalled();
    expect(connectAuthEmulator).not.toBeCalled();
  });

  it("does not connect to emulators if configured to use them but firebase was already initialized previosuly", () => {
    jest
      .mocked(getApps)
      .mockReturnValue([{} as ReturnType<typeof initializeApp>]);

    connectToFirebase(fbConfig);

    expect(connectFirestoreEmulator).not.toBeCalled();
    expect(connectAuthEmulator).not.toBeCalled();
  });
});
