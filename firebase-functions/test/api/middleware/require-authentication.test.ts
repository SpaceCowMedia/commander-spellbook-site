import admin from "firebase-admin";
import {
  createRequest,
  createResponse,
  createNext,
  createAdmin,
} from "../../helper";
import requireAuthenticationMiddleware from "../../../src/api/middleware/require-authentication";
import { PERMISSIONS } from "../../../src/shared/constants";

jest.mock("firebase-admin");

describe("requiresAuthenticationMiddleware", () => {
  beforeEach(() => {
    admin.auth = createAdmin({
      verifyIdTokenSpy: jest.fn().mockResolvedValue({}),
    });
  });

  it("errors when there is no authorization", async () => {
    const statusSpy = jest.fn();
    const jsonSpy = jest.fn();
    const req = createRequest({
      headers: {},
    });
    const res = createResponse({
      statusSpy,
      jsonSpy,
    });
    const next = createNext();

    await requireAuthenticationMiddleware(req, res, next);

    expect(next).not.toBeCalled();
    expect(statusSpy).toBeCalledTimes(1);
    expect(statusSpy).toBeCalledWith(403);
    expect(jsonSpy).toBeCalledTimes(1);
    expect(jsonSpy).toBeCalledWith({
      message: "Missing authorization header",
    });
  });

  it("errors when verifyIdToken rejects", async () => {
    admin.auth = createAdmin({
      verifyIdTokenSpy: jest.fn().mockRejectedValue(new Error("foo")),
    });

    const statusSpy = jest.fn();
    const jsonSpy = jest.fn();
    const req = createRequest();
    const res = createResponse({
      statusSpy,
      jsonSpy,
    });
    const next = createNext();

    await requireAuthenticationMiddleware(req, res, next);

    expect(next).not.toBeCalled();
    expect(statusSpy).toBeCalledTimes(1);
    expect(statusSpy).toBeCalledWith(403);
    expect(jsonSpy).toBeCalledTimes(1);
    expect(jsonSpy).toBeCalledWith({
      message: "Invalid authorization.",
    });
  });

  it("passes to next function when all conditions pass", async () => {
    const statusSpy = jest.fn();
    const jsonSpy = jest.fn();
    const req = createRequest();
    const res = createResponse({
      statusSpy,
      jsonSpy,
    });
    const next = createNext();

    await requireAuthenticationMiddleware(req, res, next);

    expect(next).toBeCalledTimes(1);
    expect(statusSpy).not.toBeCalled();
    expect(jsonSpy).not.toBeCalled();
  });

  it("attaches permissions to user object", async () => {
    const statusSpy = jest.fn();
    const jsonSpy = jest.fn();
    const req = createRequest();
    const res = createResponse({
      statusSpy,
      jsonSpy,
    });
    const next = createNext();

    admin.auth = createAdmin({
      verifyIdTokenSpy: jest.fn().mockResolvedValue({
        [PERMISSIONS.proposeCombo]: 1,
        [PERMISSIONS.provisioned]: 1,
      }),
    });

    await requireAuthenticationMiddleware(req, res, next);

    expect(req.userPermissions).toEqual(
      expect.objectContaining({
        manageUserPermissions: false,
        proposeCombo: true,
        provisioned: true,
        viewUsers: false,
      })
    );
  });
});
