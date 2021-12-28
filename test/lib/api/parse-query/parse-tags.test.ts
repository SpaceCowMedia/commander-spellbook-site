import { makeSearchParams } from "../helper";
import parseTags from "@/lib/api/parse-query/parse-tags";
import type { SearchParameters } from "@/lib/api/types";

const KINDS: ["banned", "spoiled"] = ["banned", "spoiled"];

describe("parseTags", () => {
  let searchParams: SearchParameters;

  beforeEach(() => {
    searchParams = makeSearchParams();
  });

  describe.each(KINDS)("%s", (kind) => {
    it(`supports is for ${kind}`, () => {
      parseTags(searchParams, "is", ":", kind);

      expect(searchParams.tags[kind]).toEqual("is");
    });

    it(`supports -is for ${kind}`, () => {
      parseTags(searchParams, "-is", ":", kind);

      expect(searchParams.tags[kind]).toEqual("not");
    });

    it(`supports not for ${kind}`, () => {
      parseTags(searchParams, "not", ":", kind);

      expect(searchParams.tags[kind]).toEqual("not");
    });

    it(`supports -not for ${kind}`, () => {
      parseTags(searchParams, "-not", ":", kind);

      expect(searchParams.tags[kind]).toEqual("is");
    });

    it(`supports include for ${kind}`, () => {
      parseTags(searchParams, "include", ":", kind);

      expect(searchParams.tags[kind]).toEqual("include");
    });

    it(`supports -include for ${kind}`, () => {
      parseTags(searchParams, "-include", ":", kind);

      expect(searchParams.tags[kind]).toEqual("exclude");
    });

    it(`supports exclude for ${kind}`, () => {
      parseTags(searchParams, "exclude", ":", kind);

      expect(searchParams.tags[kind]).toEqual("exclude");
    });

    it(`supports -exclude for ${kind}`, () => {
      parseTags(searchParams, "-exclude", ":", kind);

      expect(searchParams.tags[kind]).toEqual("include");
    });

    it.each(["=", ">", "<", "=>", "<="])(
      "errors for operators that are not '%s'",
      (operator) => {
        parseTags(searchParams, "is", operator, kind);

        expect(searchParams.errors[0]).toEqual({
          key: "is",
          value: kind,
          message: `The key "is" does not support operator "${operator}".`,
        });
      }
    );
  });

  it("errors when unsupported tag value is used", () => {
    parseTags(searchParams, "is", ":", "unsupported");

    expect(searchParams.errors[0]).toEqual({
      key: "is",
      value: "unsupported",
      message: `The key "is" does not support value "unsupported".`,
    });
  });

  it("supports previewed as an alias for 'spoiled'", () => {
    parseTags(searchParams, "is", ":", "previewed");

    expect(searchParams.tags.spoiled).toEqual("is");
  });
});
