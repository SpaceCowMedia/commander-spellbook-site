const admin = require("firebase-admin");
const {
  createRequest,
  createResponse,
  createNext,
  createAdminAuth,
} = require("../../../helper");
const requireAuthenticationMiddleware = require("../../../../src/api/v1/middleware/require-authentication");
const { PERMISSIONS } = require("../../../../src/shared/constants");

jest.mock("firebase-admin");

describe("requiresAuthenticationMiddleware", () => {
  beforeEach(() => {
    admin.auth = createAdminAuth({
      verifyIdTokenSpy: jest.fn().mockResolvedValue({}),
    });
  });

  it("errors when there is no authorization", async () => {
    const req = createRequest({
      headers: {},
    });
    const res = createResponse();
    const next = createNext();

    await requireAuthenticationMiddleware(req, res, next);

    expect(next).not.toBeCalled();
    expect(res.status).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(403);
    expect(res.json).toBeCalledTimes(1);
    expect(res.json).toBeCalledWith({
      message: "Missing authorization header.",
    });
  });

  it("errors when authorization does not include bearer token", async () => {
    const req = createRequest({
      headers: {
        authorization: "auth",
      },
    });
    const res = createResponse();
    const next = createNext();

    await requireAuthenticationMiddleware(req, res, next);

    expect(next).not.toBeCalled();
    expect(res.status).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(403);
    expect(res.json).toBeCalledTimes(1);
    expect(res.json).toBeCalledWith({
      message: "Authorization header is malformed.",
    });
  });

  it("verifies authorization with firebase admin", async () => {
    const verifySpy = jest.fn().mockResolvedValue({});
    const req = createRequest({
      headers: {
        authorization: "Bearer auth",
      },
    });
    const res = createResponse();
    const next = createNext();

    admin.auth = createAdminAuth({
      verifyIdTokenSpy: verifySpy,
    });

    await requireAuthenticationMiddleware(req, res, next);

    expect(verifySpy).toBeCalledTimes(1);
    expect(verifySpy).toBeCalledWith("auth");
    expect(next).toBeCalledTimes(1);
  });

  it("errors when verifyIdToken rejects", async () => {
    admin.auth = createAdminAuth({
      verifyIdTokenSpy: jest.fn().mockRejectedValue(new Error("foo")),
    });

    const req = createRequest();
    const res = createResponse();
    const next = createNext();

    await requireAuthenticationMiddleware(req, res, next);

    expect(next).not.toBeCalled();
    expect(res.status).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(403);
    expect(res.json).toBeCalledTimes(1);
    expect(res.json).toBeCalledWith({
      message: "Invalid authorization.",
    });
  });

  it("passes to next function when all conditions pass", async () => {
    const req = createRequest();
    const res = createResponse();
    const next = createNext();

    await requireAuthenticationMiddleware(req, res, next);

    expect(next).toBeCalledTimes(1);
    expect(res.status).not.toBeCalled();
    expect(res.json).not.toBeCalled();
  });

  it("attaches permissions to request object", async () => {
    const req = createRequest();
    const res = createResponse();
    const next = createNext();

    admin.auth = createAdminAuth({
      verifyIdTokenSpy: jest.fn().mockResolvedValue({
        [PERMISSIONS.proposeCombo]: 1,
        [PERMISSIONS.provisioned]: 1,
      }),
    });

    await requireAuthenticationMiddleware(req, res, next);

    expect(req.userPermissions).toEqual(
      expect.objectContaining({
        manageUsers: false,
        proposeCombo: true,
        provisioned: true,
        viewUsers: false,
      })
    );
  });

  it("attaches user id to request object", async () => {
    const req = createRequest();
    const res = createResponse();
    const next = createNext();

    admin.auth = createAdminAuth({
      verifyIdTokenSpy: jest.fn().mockResolvedValue({
        [PERMISSIONS.proposeCombo]: 1,
        [PERMISSIONS.provisioned]: 1,
        user_id: "user-123",
      }),
    });

    await requireAuthenticationMiddleware(req, res, next);

    expect(req.userId).toEqual("user-123");
  });
});
