import { createRequest, createResponse, createNext } from "../../../helper";
import requireManageSiteContentMiddleware from "../../../../src/api/v1/middleware/require-manage-site-content-permission";
import { PermissionError } from "../../../../src/api/error";

describe("requireManageSiteContentMiddleware", () => {
  it("errors when user does not have the manageSiteContent permission", async () => {
    const req = createRequest({
      userPermissions: {
        manageSiteContent: false,
      },
    });
    const res = createResponse();
    const next = createNext();

    await requireManageSiteContentMiddleware(req, res, next);

    expect(next).not.toBeCalled();
    expect(res.status).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(403);
    expect(res.json).toBeCalledTimes(1);
    expect(res.json).toBeCalledWith(
      new PermissionError(
        "Your user does not have the 'manage site content' permission."
      )
    );
  });

  it("passes to next function when all conditions pass", async () => {
    const req = createRequest({
      userPermissions: {
        manageSiteContent: true,
      },
    });
    const res = createResponse();
    const next = createNext();

    await requireManageSiteContentMiddleware(req, res, next);

    expect(next).toBeCalledTimes(1);
    expect(res.status).not.toBeCalled();
    expect(res.json).not.toBeCalled();
  });
});
