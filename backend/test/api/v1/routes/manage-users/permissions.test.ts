import { createRequest, createResponse } from "../../../../helper";
import managePermissions from "../../../../../src/api/v1/routes/manage-users/permissions";
import {
  Permissions,
  validatePermissions,
  getPermissions,
  setPermissions,
} from "../../../../../src/api/v1/services/permissions";
import { ValidationError, UnknownError } from "../../../../../src/api/error";

jest.mock("../../../../../src/api/v1/services/permissions");

describe("manage-users/:userId/permissions", () => {
  it("errors with a 400 when validatePermissions throws a validation error", async () => {
    const res = createResponse();
    const req = createRequest({
      params: {
        userId: "some-user-id",
      },
      body: {},
    });

    const error = new ValidationError("permissions error");
    jest.mocked(validatePermissions).mockRejectedValue(error);

    await managePermissions(req, res);

    expect(getPermissions).not.toBeCalled();
    expect(setPermissions).not.toBeCalled();

    expect(res.status).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(400);
    expect(res.json).toBeCalledTimes(1);
    expect(res.json).toBeCalledWith(error);
  });

  it("errors with a 500 when validatePermissions throws any other error", async () => {
    const res = createResponse();
    const req = createRequest({
      params: {
        userId: "some-user-id",
      },
      body: {},
    });

    const error = new Error("some error");
    jest.mocked(validatePermissions).mockRejectedValue(error);

    await managePermissions(req, res);

    expect(getPermissions).not.toBeCalled();
    expect(setPermissions).not.toBeCalled();

    expect(res.status).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(500);
    expect(res.json).toBeCalledTimes(1);
    expect(res.json).toBeCalledWith(new UnknownError("Something went wrong."));
  });

  it("errors with a 400 when getPermissions throws a validation error", async () => {
    const res = createResponse();
    const req = createRequest({
      params: {
        userId: "some-user-id",
      },
      body: {},
    });

    const error = new ValidationError("permissions error");
    jest.mocked(getPermissions).mockRejectedValue(error);

    await managePermissions(req, res);

    expect(getPermissions).toBeCalledTimes(1);
    expect(getPermissions).toBeCalledWith("some-user-id");
    expect(setPermissions).not.toBeCalled();

    expect(res.status).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(400);
    expect(res.json).toBeCalledTimes(1);
    expect(res.json).toBeCalledWith(error);
  });

  it("errors with a 500 when getPermissions throws any other error", async () => {
    const res = createResponse();
    const req = createRequest({
      params: {
        userId: "some-user-id",
      },
      body: {},
    });

    const error = new Error("some error");
    jest.mocked(getPermissions).mockRejectedValue(error);

    await managePermissions(req, res);

    expect(getPermissions).toBeCalledTimes(1);
    expect(getPermissions).toBeCalledWith("some-user-id");
    expect(setPermissions).not.toBeCalled();

    expect(res.status).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(500);
    expect(res.json).toBeCalledTimes(1);
    expect(res.json).toBeCalledWith(new UnknownError("Something went wrong."));
  });

  it("errors with a 400 when setPermissions throws a validation error", async () => {
    const res = createResponse();
    const req = createRequest({
      params: {
        userId: "some-user-id",
      },
      body: {
        permissions: {
          proposeCombo: true,
        },
      },
    });

    const error = new ValidationError("permissions error");
    jest.mocked(setPermissions).mockRejectedValue(error);

    await managePermissions(req, res);

    expect(getPermissions).toBeCalledTimes(1);
    expect(getPermissions).toBeCalledWith("some-user-id");
    expect(setPermissions).toBeCalledTimes(1);
    expect(setPermissions).toBeCalledWith("some-user-id", {
      proposeCombo: true,
    });

    expect(res.status).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(400);
    expect(res.json).toBeCalledTimes(1);
    expect(res.json).toBeCalledWith(error);
  });

  it("errors with a 500 when setPermissions throws any other error", async () => {
    const res = createResponse();
    const req = createRequest({
      params: {
        userId: "some-user-id",
      },
      body: {
        permissions: {
          proposeCombo: true,
        },
      },
    });

    const error = new Error("some error");
    jest.mocked(setPermissions).mockRejectedValue(error);

    await managePermissions(req, res);

    expect(getPermissions).toBeCalledTimes(1);
    expect(getPermissions).toBeCalledWith("some-user-id");
    expect(setPermissions).toBeCalledTimes(1);
    expect(setPermissions).toBeCalledWith("some-user-id", {
      proposeCombo: true,
    });

    expect(res.status).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(500);
    expect(res.json).toBeCalledTimes(1);
    expect(res.json).toBeCalledWith(new UnknownError("Something went wrong."));
  });

  it("errors with a 400 when changing the manage user permissions option for self", async () => {
    const res = createResponse();
    const req = createRequest({
      userId: "admin-uuid",
      params: {
        userId: "admin-uuid",
      },
      body: {
        permissions: {
          manageUsers: false,
        },
      },
    });

    await managePermissions(req, res);

    expect(getPermissions).not.toBeCalled();
    expect(setPermissions).not.toBeCalled();
    expect(res.status).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(400);
    expect(res.json).toBeCalledTimes(1);
    expect(res.json).toBeCalledWith(
      new ValidationError(
        "You cannot change the manage users option for yourself. Enlist another user with the `manage user permissions` permission to do this for you."
      )
    );
  });

  it("can update own permissions when manage user permissions option is omitted", async () => {
    const res = createResponse();
    const req = createRequest({
      userId: "admin-uuid",
      params: {
        userId: "admin-uuid",
      },
      body: {
        permissions: {
          proposeCombo: false,
        },
      },
    });

    await managePermissions(req, res);

    expect(setPermissions).toBeCalledWith("admin-uuid", {
      proposeCombo: false,
    });

    expect(res.status).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(201);
    expect(res.json).toBeCalledTimes(1);
    expect(res.json).toBeCalledWith({ success: true });
  });

  it("sets custom claims on the user without changing unmodified ones", async () => {
    const res = createResponse();
    const req = createRequest({
      params: {
        userId: "some-uuid",
      },
      body: {
        permissions: {
          proposeCombo: false,
          manageUsers: true,
        },
      },
    });

    jest.mocked(getPermissions).mockResolvedValue({
      provisioned: true,
      proposeCombo: true,
      viewUsers: false,
    } as Permissions);

    await managePermissions(req, res);

    expect(getPermissions).toBeCalledTimes(1);
    expect(getPermissions).toBeCalledWith("some-uuid");

    expect(setPermissions).toBeCalledTimes(1);
    expect(setPermissions).toBeCalledWith("some-uuid", {
      provisioned: true,
      proposeCombo: false,
      manageUsers: true,
      viewUsers: false,
    });

    expect(res.status).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(201);
    expect(res.json).toBeCalledTimes(1);
    expect(res.json).toBeCalledWith({
      success: true,
    });
  });
});
