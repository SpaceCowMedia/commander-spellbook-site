import SiteSetting from "../../../../../src/db/site-setting";
import { createRequest, createResponse } from "../../../../helper";
import updateFeatured from "../../../../../src/api/v1/routes/site/update-featured";

jest.mock("../../../../../src/db/site-setting");

describe("site/update-featured", () => {
  beforeEach(() => {
    jest
      .mocked(SiteSetting.updateFeaturedSettings)
      .mockResolvedValue({} as FirebaseFirestore.WriteResult);
  });

  it("errors with a 400 when update fails", async () => {
    const res = createResponse();
    const req = createRequest({
      body: {},
    });

    jest
      .mocked(SiteSetting.updateFeaturedSettings)
      .mockRejectedValue(new Error("something went wrong"));

    await updateFeatured(req, res);

    expect(res.status).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(400);
    expect(res.json).toBeCalledTimes(1);
    expect(res.json).toBeCalledWith(new Error("something went wrong"));
  });

  it("returns a 200 when update completes", async () => {
    const res = createResponse();
    const req = createRequest({
      body: {
        buttonText: "foo",
        rules: [{ kind: "card", setCode: "mh1" }],
      },
    });

    await updateFeatured(req, res);

    expect(res.status).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(200);
    expect(res.json).toBeCalledTimes(1);
    expect(res.json).toBeCalledWith({
      success: true,
    });
  });
});
