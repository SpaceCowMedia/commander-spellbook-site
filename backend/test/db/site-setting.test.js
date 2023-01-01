const SiteSetting = require("../../src/db/site-setting");
const { ValidationError } = require("../../src/api/error");

jest.mock("../../src/db/document-base");

describe("SiteSetting", () => {
  describe("updateFeaturedSettings", () => {
    it("rejects when buttonText is missing", async () => {
      await expect(
        SiteSetting.updateFeaturedSettings({
          rules: [
            {
              kind: "card",
              setCode: "abc",
            },
          ],
        })
      ).rejects.toEqual(
        new ValidationError("Featured combos is missing buttonText or rules.")
      );
    });

    it("rejects when rules is missing", async () => {
      await expect(
        SiteSetting.updateFeaturedSettings({
          buttonText: "foo",
        })
      ).rejects.toEqual(
        new ValidationError("Featured combos is missing buttonText or rules.")
      );
    });

    it("rejects when rules is empty", async () => {
      await expect(
        SiteSetting.updateFeaturedSettings({
          buttonText: "foo",
          rules: [],
        })
      ).rejects.toEqual(
        new ValidationError("Featured combos is missing buttonText or rules.")
      );
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
              kind: "not-a-kind",
            },
          ],
        })
      ).rejects.toEqual(
        new ValidationError("At least one featured combo rule is malformed.")
      );

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
              foo: "bar",
            },
            {
              kind: "card",
              cardName: "bar",
            },
          ],
        })
      ).rejects.toEqual(
        new ValidationError("At least one featured combo rule is malformed.")
      );
    });

    it("sets settings data when all rules are correctly formed", async () => {
      await SiteSetting.updateFeaturedSettings({
        buttonText: "foo",
        rules: [
          {
            kind: "card",
            setCode: "Bar",
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
        buttonText: {},
        rules: [
          {
            kind: "card",
            setCode: {},
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
            setCode: "[object object]",
            cardName: "[object Object]",
          },
        ],
      });
    });
  });
});
