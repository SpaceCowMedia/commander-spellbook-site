import admin from "firebase-admin";
import UserProfile from "../../../../../src/db/user-profile";
import Username from "../../../../../src/db/username";
import {
  createAdminAuth,
  createRequest,
  createResponse,
} from "../../../../helper";
import provision from "../../../../../src/api/v1/routes/user/provision";
import { PERMISSIONS } from "../../../../../src/shared/constants";

jest.mock("firebase-admin");

describe("user/provision", () => {
  let claimsSpy: jest.SpyInstance;
  let updateSpy: jest.SpyInstance;

  beforeEach(() => {
    claimsSpy = jest.fn();
    updateSpy = jest.fn();
    admin.auth = createAdminAuth({
      claimsSpy,
      updateUserSpy: updateSpy,
    });
    jest.spyOn(Username, "exists").mockResolvedValue(false);
    jest
      .spyOn(Username, "createWithId")
      .mockResolvedValue({} as FirebaseFirestore.WriteResult);
    jest
      .spyOn(UserProfile, "createWithId")
      .mockResolvedValue({} as FirebaseFirestore.WriteResult);
  });

  it("errors with a 400 when no username is present", async () => {
    const res = createResponse();
    const req = createRequest({
      body: {},
    });

    await provision(req, res);

    expect(res.status).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(400);
    expect(res.json).toBeCalledTimes(1);
    expect(res.json).toBeCalledWith({
      message: "Requires username to provision.",
    });
  });

  it("errors with a 400 when a username made up of blank space is provided", async () => {
    const res = createResponse();
    const req = createRequest({
      body: { username: "    " },
    });

    await provision(req, res);

    expect(res.status).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(400);
    expect(res.json).toBeCalledTimes(1);
    expect(res.json).toBeCalledWith({
      message: "Requires username to provision.",
    });
  });

  it("errors when username has invalid characters", async () => {
    const res = createResponse();
    const req = createRequest({
      body: { username: "  as-df!@123  " },
      userPermissions: {
        provisioned: false,
      },
    });

    await provision(req, res);

    expect(res.status).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(400);
    expect(res.json).toBeCalledTimes(1);
    expect(res.json).toBeCalledWith({
      message: "Username must only have alphanumeric characters or _.",
    });
  });

  it("errors with a 400 when user is already provisioned", async () => {
    const res = createResponse();
    const req = createRequest({
      body: {
        username: "my_username",
      },
      userPermissions: {
        provisioned: true,
      },
    });

    await provision(req, res);

    expect(res.status).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(400);
    expect(res.json).toBeCalledTimes(1);
    expect(res.json).toBeCalledWith({
      message: "User is already provisioned.",
    });
  });

  it("errors with a 400 when username is already taken", async () => {
    const res = createResponse();
    const req = createRequest({
      body: {
        username: "My_Username",
      },
      userPermissions: {
        provisioned: false,
      },
    });

    jest.mocked(Username.exists).mockResolvedValue(true);
    await provision(req, res);

    expect(Username.exists).toBeCalledTimes(1);
    expect(Username.exists).toBeCalledWith("my_username");

    expect(res.status).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(400);
    expect(res.json).toBeCalledTimes(1);
    expect(res.json).toBeCalledWith({
      message: '"My_Username" is not an available username.',
    });
  });

  it("creates a username document", async () => {
    const res = createResponse();
    const req = createRequest({
      body: {
        username: "My_User name",
      },
      userPermissions: {
        provisioned: false,
      },
    });

    await provision(req, res);

    expect(Username.createWithId).toBeCalledTimes(1);
    expect(Username.createWithId).toBeCalledWith("my_username", {
      userId: "user-id",
    });
  });

  it("creates a UserProfile document", async () => {
    const res = createResponse();
    const req = createRequest({
      body: {
        username: "My_User name",
      },
      userPermissions: {
        provisioned: false,
      },
    });

    await provision(req, res);

    expect(UserProfile.createWithId).toBeCalledTimes(1);
    expect(UserProfile.createWithId).toBeCalledWith("user-id", {
      username: "My_User name",
    });
  });

  it("updates the user display name", async () => {
    const res = createResponse();
    const req = createRequest({
      body: {
        username: "My_User name",
      },
      userPermissions: {
        provisioned: false,
      },
    });

    await provision(req, res);

    expect(updateSpy).toBeCalledTimes(1);
    expect(updateSpy).toBeCalledWith("user-id", {
      displayName: "My_User name",
    });
  });

  it("sets default permissions", async () => {
    const res = createResponse();
    const req = createRequest({
      body: {
        username: "My_Username",
      },
      userPermissions: {
        provisioned: false,
      },
    });

    await provision(req, res);

    expect(claimsSpy).toBeCalledTimes(1);
    expect(claimsSpy).toBeCalledWith("user-id", {
      [PERMISSIONS.provisioned]: 1,
      [PERMISSIONS.proposeCombo]: 1,
    });
  });

  it("resolves request with data when successful", async () => {
    const res = createResponse();
    const req = createRequest({
      body: {
        username: "My_Username",
      },
      userPermissions: {
        provisioned: false,
      },
    });

    await provision(req, res);

    expect(UserProfile.createWithId).toBeCalledTimes(1);
    expect(UserProfile.createWithId).toBeCalledWith("user-id", {
      username: "My_Username",
    });

    expect(res.status).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(201);
    expect(res.json).toBeCalledTimes(1);
    expect(res.json).toBeCalledWith({
      permissions: { proposeCombo: true },
      username: "My_Username",
    });
  });
});
