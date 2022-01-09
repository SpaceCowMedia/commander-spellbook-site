import SiteSetting from "../../src/db/site-setting";

jest.mock("../../src/db/document-base");

describe("SiteSetting", () => {
  beforeEach(() => {
    // TODO - set BaseDocument.getDocumentSnapshot to return fake UserProfile document
  });

  describe("updateFeaturedSettings", () => {
    it("rejects when buttonText is missing", async () => {
      await expect(
        // @ts-ignore
        SiteSetting.updateFeaturedSettings({
          rules: [
            {
              kind: "card",
              setCode: "abc",
            },
          ],
        })
      ).rejects.toEqual(new Error("Missing buttonText or rules"));
    });

    it("rejects when rules is missing", async () => {
      await expect(
        // @ts-ignore
        SiteSetting.updateFeaturedSettings({
          buttonText: "foo",
        })
      ).rejects.toEqual(new Error("Missing buttonText or rules"));
    });

    it("rejects when rules is empty", async () => {
      await expect(
        SiteSetting.updateFeaturedSettings({
          buttonText: "foo",
          rules: [],
        })
      ).rejects.toEqual(new Error("Missing buttonText or rules"));
    });

    it("rejects when at least one rule is malformed", async () => {
      await expect(
        SiteSetting.updateFeaturedSettings({
          buttonText: "foo",
          rules: [
            {
              kind: "card",
              setCode: "bar",
            },
            // this one is malformed for having an invalid kind
            {
              // @ts-ignore
              kind: "not-a-kind",
            },
          ],
        })
      ).rejects.toEqual(new Error("Rules malformed."));

      await expect(
        SiteSetting.updateFeaturedSettings({
          buttonText: "foo",
          rules: [
            {
              kind: "card",
              setCode: "bar",
            },
            // this one is malformed for not having an acceptable value for card
            {
              kind: "card",
              // @ts-ignore
              foo: "bar",
            },
            {
              kind: "card",
              cardName: "bar",
            },
          ],
        })
      ).rejects.toEqual(new Error("Rules malformed."));
    });

    it("sets settings data when all rules are correctly formed", async () => {
      await SiteSetting.updateFeaturedSettings({
        buttonText: "foo",
        rules: [
          {
            kind: "card",
            setCode: "bar",
          },
          {
            kind: "card",
            cardName: "bar",
          },
        ],
      });

      expect(SiteSetting.update).toBeCalledTimes(1);
      expect(SiteSetting.update).toBeCalledWith("featured-combos", {
        buttonText: "foo",
        rules: [
          {
            kind: "card",
            setCode: "bar",
            cardName: "",
          },
          {
            kind: "card",
            setCode: "",
            cardName: "bar",
          },
        ],
      });
    });

    it("sanitizes inputs", async () => {
      await SiteSetting.updateFeaturedSettings({
        // @ts-ignore
        buttonText: {},
        rules: [
          {
            kind: "card",
            // @ts-ignore
            setCode: {},
            // @ts-ignore
            cardName: {},
          },
        ],
      });

      expect(SiteSetting.update).toBeCalledTimes(1);
      expect(SiteSetting.update).toBeCalledWith("featured-combos", {
        buttonText: "[object Object]",
        rules: [
          {
            kind: "card",
            setCode: "[object Object]",
            cardName: "[object Object]",
          },
        ],
      });
    });
  });
});
