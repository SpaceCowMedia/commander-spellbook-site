import { makeSearchParams } from "../helper";
import parsePriceData from "@/lib/api/parse-query/parse-price-data";
import type { SearchParameters } from "@/lib/api/types";

describe("parsePriceData", () => {
  let searchParams: SearchParameters;

  beforeEach(() => {
    searchParams = makeSearchParams();
  });

  it("gives error when : operator is used", () => {
    parsePriceData(searchParams, "price", ":", "4");

    expect(searchParams.errors.length).toBe(1);
    expect(searchParams.errors[0]).toEqual({
      key: "price",
      value: "4",
      message: 'The key "price" does not support operator ":".',
    });
  });

  it("gives error when non-number value is passed", () => {
    parsePriceData(searchParams, "price", "=", "not a number");

    expect(searchParams.errors.length).toBe(1);
    expect(searchParams.errors[0]).toEqual({
      key: "price",
      value: "not a number",
      message: 'The key "price" is not compatible with value "not a number".',
    });
  });

  it("gives error when number is less than 0", () => {
    parsePriceData(searchParams, "price", "=", "-1");

    expect(searchParams.errors.length).toBe(1);
    expect(searchParams.errors[0]).toEqual({
      key: "price",
      value: "-1",
      message: 'The key "price" is not compatible with value "-1".',
    });
  });

  it("adds a filter", () => {
    parsePriceData(searchParams, "price", "=", "4");
    parsePriceData(searchParams, "price", ">", "2");

    expect(searchParams.price.filters.length).toBe(2);
    expect(searchParams.price.filters[0]).toEqual({
      method: "=",
      value: 4,
    });
    expect(searchParams.price.filters[1]).toEqual({
      method: ">",
      value: 2,
    });
  });

  it("defaults to no vendor", () => {
    parsePriceData(searchParams, "price", "=", "4");

    expect(searchParams.price.vendor).toBeFalsy();
  });

  it.each([":", "="])("can pass a vendor with %s operator", (operator) => {
    parsePriceData(searchParams, "vendor", operator, "tcgplayer");

    expect(searchParams.price.vendor).toBe("tcgplayer");
  });

  it.each([">", "<", ">=", "<="])(
    "errors when %s operator is used with vendor",
    (operator) => {
      parsePriceData(searchParams, "vendor", operator, "tcgplayer");

      expect(searchParams.errors.length).toBe(1);
      expect(searchParams.errors[0]).toEqual({
        key: "vendor",
        value: "tcgplayer",
        message: `The key "vendor" does not support operator "${operator}".`,
      });
    }
  );

  it("errors when vendor is already specified", () => {
    parsePriceData(searchParams, "vendor", ":", "tcgplayer");
    parsePriceData(searchParams, "vendor", ":", "cardkingdom");

    expect(searchParams.errors.length).toBe(1);
    expect(searchParams.errors[0]).toEqual({
      key: "vendor",
      value: "cardkingdom",
      message: `Vendor option "tcgplayer" already chosen. Vendor choice "cardkingdom" will be ignored.`,
    });
  });

  it("errors when invalid vendor is specified", () => {
    parsePriceData(searchParams, "vendor", ":", "not-valid");

    expect(searchParams.errors.length).toBe(1);
    expect(searchParams.errors[0]).toEqual({
      key: "vendor",
      value: "not-valid",
      message: `Vendor option "not-valid" is not a valid vendor.`,
    });
  });
});
