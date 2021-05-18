import parseSort from "@/lib/api/parse-query/parse-sort";
import type { SearchParameters } from "@/lib/api/types";
import { makeSearchParams } from "../helper";

describe("parseSort", () => {
  let searchParams: SearchParameters;

  beforeEach(() => {
    searchParams = makeSearchParams();
  });

  it.each([
    "results",
    "steps",
    "prerequisites",
    "cards",
    "id",
    "colors",
    "popularity",
  ])("suports %s", (kind) => {
    parseSort(searchParams, ":", kind);

    expect(searchParams.sort).toEqual(kind);
  });

  it.each(["color", "ci", "coloridentity", "color-identity"])(
    "supports %s as alias for colors",
    (kind) => {
      parseSort(searchParams, "=", kind);

      expect(searchParams.sort).toEqual("colors");
    }
  );

  it.each(["deck", "decks"])("supports %s as alias for popularity", (kind) => {
    parseSort(searchParams, "=", kind);

    expect(searchParams.sort).toEqual("popularity");
  });

  it("provides error if invalid value is used for sort", () => {
    parseSort(searchParams, ":", "foo");

    expect(searchParams.sort).toBeFalsy();
    expect(searchParams.errors[0]).toEqual({
      key: "sort",
      value: "foo",
      message: `Unknown sort option "foo".`,
    });
  });

  it("provides error if sort is already specified", () => {
    parseSort(searchParams, ":", "results");

    parseSort(searchParams, ":", "cards");

    expect(searchParams.sort).toEqual("results");
    expect(searchParams.errors[0]).toEqual({
      key: "sort",
      value: "cards",
      message: `Sort option "results" already chosen. Sorting by "cards" will be ignored.`,
    });
  });

  it("provides error if invalid operator is used", () => {
    parseSort(searchParams, ">", "cards");

    expect(searchParams.sort).toBeFalsy();
    expect(searchParams.errors[0]).toEqual({
      key: "sort",
      value: "cards",
      message: `Sort does not support the ">" operator.`,
    });
  });
});
