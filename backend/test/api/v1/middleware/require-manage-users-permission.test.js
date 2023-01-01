const {
  createRequest,
  createResponse,
  createNext,
} = require("../../../helper");
const requireManageUsersPermission = require("../../../../src/api/v1/middleware/require-manage-users-permission");
const { PermissionError } = require("../../../../src/api/error");

describe("requireManageUsersPermission", () => {
  it("errors when user does not have the manageUsers permission", async () => {
    const req = createRequest({
      userPermissions: {
        manageUsers: false,
      },
    });
    const res = createResponse();
    const next = createNext();

    await requireManageUsersPermission(req, res, next);

    expect(next).not.toBeCalled();
    expect(res.status).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(403);
    expect(res.json).toBeCalledTimes(1);
    expect(res.json).toBeCalledWith(
      new PermissionError(
        "Your user does not have the 'manage users' permission."
      )
    );
  });

  it("passes to next function when all conditions pass", async () => {
    const req = createRequest({
      userPermissions: {
        manageUsers: true,
      },
    });
    const res = createResponse();
    const next = createNext();

    await requireManageUsersPermission(req, res, next);

    expect(next).toBeCalledTimes(1);
    expect(res.status).not.toBeCalled();
    expect(res.json).not.toBeCalled();
  });
});
