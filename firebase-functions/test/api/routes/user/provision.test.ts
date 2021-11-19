import UserProfile from "../../../../src/db/user-profile";
import Username from "../../../../src/db/username";
import { createRequest, createResponse } from "../../../helper";
import provision from "../../../../src/api/routes/user/provision";

describe("user/provision", () => {
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

  it("errors with a 400 when user already has a user profile", async () => {
    const res = createResponse();
    const req = createRequest({
      body: {
        username: "my_username",
      },
      userPermissions: {
        provisioned: false,
      },
    });

    jest.spyOn(UserProfile, "exists").mockResolvedValue(true);
    await provision(req, res);

    expect(UserProfile.exists).toBeCalledTimes(1);
    expect(UserProfile.exists).toBeCalledWith("user-id");

    expect(res.status).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(400);
    expect(res.json).toBeCalledTimes(1);
    expect(res.json).toBeCalledWith({
      message: 'User Profile for user with id "user-id" already exists',
    });
  });

  it("errors with a 400 when username is already taken", async () => {
    const res = createResponse();
    const req = createRequest({
      body: {
        username: "my_username",
      },
      userPermissions: {
        provisioned: false,
      },
    });

    jest.spyOn(UserProfile, "exists").mockResolvedValue(false);
    jest.spyOn(Username, "exists").mockResolvedValue(true);
    await provision(req, res);

    expect(Username.exists).toBeCalledTimes(1);
    expect(Username.exists).toBeCalledWith("my_username");

    expect(res.status).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(400);
    expect(res.json).toBeCalledTimes(1);
    expect(res.json).toBeCalledWith({
      message: '"my_username" is not an available username.',
    });
  });
});
