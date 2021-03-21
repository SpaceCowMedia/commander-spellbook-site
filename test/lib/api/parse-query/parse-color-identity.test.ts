import parseColorIdentity from "@/lib/api/parse-query/parse-color-identity";
import type { SearchParameters } from "@/lib/api/types";
import { makeSearchParams } from "../helper";

describe("parseColorIdentity", () => {
  let searchParams: SearchParameters;

  beforeEach(() => {
    searchParams = makeSearchParams();
  });

  it.each([":", "=", ">", "<", ">=", "<="])(
    "parses ci query with number with %s",
    (operator) => {
      parseColorIdentity(searchParams, "ci", operator, "4");

      expect(searchParams).toEqual(
        expect.objectContaining({
          errors: [],
          colorIdentity: {
            excludeFilters: [],
            includeFilters: [],
            sizeFilters: [
              {
                method: operator,
                value: 4,
              },
            ],
          },
        })
      );
    }
  );

  it.each([":", "=", ">", "<", ">=", "<="])(
    "does not support %s operator with -ci",
    (operator) => {
      parseColorIdentity(searchParams, "-ci", operator, "4");

      expect(searchParams).toEqual(
        expect.objectContaining({
          errors: [
            {
              key: "-ci",
              value: "4",
              message: `The key "-ci" does not support operator "${operator}".`,
            },
          ],
          colorIdentity: {
            excludeFilters: [],
            includeFilters: [],
            sizeFilters: [],
          },
        })
      );
    }
  );

  it("ignores color identity when number is greater than 5", () => {
    parseColorIdentity(searchParams, "ci", ":", "6");

    expect(searchParams).toEqual(
      expect.objectContaining({
        errors: [],
        colorIdentity: {
          includeFilters: [
            {
              method: ":",
              value: [],
            },
          ],
          excludeFilters: [],
          sizeFilters: [],
        },
      })
    );
  });

  it("ignores color identity when number is less than 0", () => {
    parseColorIdentity(searchParams, "ci", ":", "-1");

    expect(searchParams).toEqual(
      expect.objectContaining({
        errors: [],
        colorIdentity: {
          includeFilters: [
            {
              method: ":",
              value: [],
            },
          ],
          excludeFilters: [],
          sizeFilters: [],
        },
      })
    );
  });

  it.each(["=", ">", ">=", "<", "<="])(
    "supports ci with %s operator",
    (operator) => {
      parseColorIdentity(searchParams, "ci", operator, "gr");

      expect(searchParams).toEqual(
        expect.objectContaining({
          errors: [],
          colorIdentity: {
            includeFilters: [
              {
                method: operator,
                value: ["g", "r"],
              },
            ],
            excludeFilters: [],
            sizeFilters: [],
          },
        })
      );
    }
  );

  it.each(["=", ">", ">=", "<", "<="])(
    "supports -ci with %s operator",
    (operator) => {
      parseColorIdentity(searchParams, "-ci", operator, "gr");

      expect(searchParams).toEqual(
        expect.objectContaining({
          errors: [],
          colorIdentity: {
            excludeFilters: [
              {
                method: operator,
                value: ["g", "r"],
              },
            ],
            includeFilters: [],
            sizeFilters: [],
          },
        })
      );
    }
  );
});
