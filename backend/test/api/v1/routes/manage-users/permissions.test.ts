import admin from "firebase-admin";
import {
  createAdminAuth,
  createRequest,
  createResponse,
} from "../../../../helper";
import managePermissions from "../../../../../src/api/v1/routes/manage-users/permissions";
import {
  PermissionError,
  ValidationError,
  UnknownError,
} from "../../../../../src/api/error";

jest.mock("firebase-admin");

describe("manage-users/:userId/permissions", () => {
  let claimsSpy: jest.SpyInstance;
  let getUserSpy: jest.SpyInstance;

  beforeEach(() => {
    claimsSpy = jest.fn();
    getUserSpy = jest.fn();
    admin.auth = createAdminAuth({
      claimsSpy,
      getUserSpy,
    });
  });

  it("errors with a 403 when requesting user does not have permission to manage user permissions", async () => {
    const res = createResponse();
    const req = createRequest({
      userPermissions: {
        manageUsers: false,
      },
    });

    await managePermissions(req, res);

    expect(res.status).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(403);
    expect(res.json).toBeCalledTimes(1);
    expect(res.json).toBeCalledWith(
      new PermissionError(
        "You do not have permission to manage another user's permissions"
      )
    );
  });

  it("errors with a 400 when no permissions are provided", async () => {
    const res = createResponse();
    const req = createRequest({
      params: {
        userId: "some-user-id",
      },
      body: {},
      userPermissions: {
        manageUsers: true,
      },
    });

    await managePermissions(req, res);

    expect(res.status).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(400);
    expect(res.json).toBeCalledTimes(1);
    expect(res.json).toBeCalledWith(
      new ValidationError("Must provide permissions in post body.")
    );
  });

  it("errors with a 400 when any permission is not a boolean", async () => {
    const res = createResponse();
    const req = createRequest({
      params: {
        userId: "some-user-id",
      },
      body: {
        permissions: {
          proposeCombo: true,
          manageUsers: "false",
        },
      },
      userPermissions: {
        manageUsers: true,
      },
    });

    await managePermissions(req, res);

    expect(res.status).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(400);
    expect(res.json).toBeCalledTimes(1);
    expect(res.json).toBeCalledWith(
      new ValidationError("Invalid permission(s): manageUsers")
    );
  });

  it("errors with a 400 when passing a permission key that does not exist", async () => {
    const res = createResponse();
    const req = createRequest({
      params: {
        userId: "some-uuid",
      },
      body: {
        permissions: {
          invalidKey: true,
          anotherInvalidKey: true,
        },
      },
      userPermissions: {
        manageUsers: true,
      },
    });

    await managePermissions(req, res);

    expect(res.status).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(400);
    expect(res.json).toBeCalledTimes(1);
    expect(res.json).toBeCalledWith(
      new ValidationError(
        "Invalid permission(s): invalidKey, anotherInvalidKey"
      )
    );
  });

  it("errors with a 400 when attempting to change provisioned claim", async () => {
    const res = createResponse();
    const req = createRequest({
      params: {
        userId: "some-user-id",
      },
      body: {
        permissions: { provisioned: false },
      },
      userPermissions: {
        manageUsers: true,
      },
    });

    await managePermissions(req, res);

    expect(res.status).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(400);
    expect(res.json).toBeCalledTimes(1);
    expect(res.json).toBeCalledWith(
      new ValidationError("Cannot change provisioned permission.")
    );
  });

  it("errors with a 400 when permissions are an empty object", async () => {
    const res = createResponse();
    const req = createRequest({
      params: {
        userId: "some-user-id",
      },
      body: { permissions: {} },
      userPermissions: {
        manageUsers: true,
      },
    });

    await managePermissions(req, res);

    expect(res.status).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(400);
    expect(res.json).toBeCalledTimes(1);
    expect(res.json).toBeCalledWith(
      new ValidationError("Must provide permissions in post body.")
    );
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
      userPermissions: {
        manageUsers: true,
      },
    });

    await managePermissions(req, res);

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
      userPermissions: {
        proposeCombo: true,
        manageUsers: true,
      },
    });

    getUserSpy.mockResolvedValue({ customClaims: { r: 1, p: 1, m: 1 } });
    claimsSpy.mockResolvedValue({});

    await managePermissions(req, res);

    expect(res.status).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(201);
    expect(res.json).toBeCalledTimes(1);
    expect(res.json).toBeCalledWith({ success: true });
  });

  it("errors with a 400 when user does not exist", async () => {
    const res = createResponse();
    const req = createRequest({
      params: {
        userId: "missing-uuid",
      },
      body: {
        permissions: {
          proposeCombo: true,
        },
      },
      userPermissions: {
        manageUsers: true,
      },
    });

    getUserSpy.mockRejectedValue(new Error("no user"));

    await managePermissions(req, res);

    expect(res.status).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(400);
    expect(res.json).toBeCalledTimes(1);
    expect(res.json).toBeCalledWith(
      new ValidationError("User with id 'missing-uuid' does not exist.")
    );
  });

  it("errors with a 400 when setting claims fails", async () => {
    const res = createResponse();
    const req = createRequest({
      params: {
        userId: "some-uuid",
      },
      body: {
        permissions: {
          proposeCombo: true,
        },
      },
      userPermissions: {
        manageUsers: true,
      },
    });

    getUserSpy.mockResolvedValue({ customClaims: { r: 1, p: 1 } });
    claimsSpy.mockRejectedValue(new Error("something went wrong"));

    await managePermissions(req, res);

    expect(res.status).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(500);
    expect(res.json).toBeCalledTimes(1);
    expect(res.json).toBeCalledWith(
      new UnknownError(
        "Something went wrong when setting permissions for 'some-uuid'."
      )
    );
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
      userPermissions: {
        manageUsers: true,
      },
    });

    getUserSpy.mockResolvedValue({ customClaims: { r: 1, p: 1 } });
    claimsSpy.mockResolvedValue({});

    await managePermissions(req, res);

    expect(getUserSpy).toBeCalledTimes(1);
    expect(getUserSpy).toBeCalledWith("some-uuid");

    expect(claimsSpy).toBeCalledTimes(1);
    expect(claimsSpy).toBeCalledWith("some-uuid", {
      r: 1,
      p: 0,
      m: 1,
    });

    expect(res.status).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(201);
    expect(res.json).toBeCalledTimes(1);
    expect(res.json).toBeCalledWith({
      success: true,
    });
  });
});
