import { mocked } from "ts-jest/utils";
import { makeSearchParams } from "./helper";
import makeFakeCombo from "@/lib/api/make-fake-combo";
import search from "@/lib/api/search";
import lookup from "@/lib/api/spellbook-api";
import filterColorIdentity from "@/lib/api/search-filters/color-identity";
import filterComboData from "@/lib/api/search-filters/combo-data";
import filterSize from "@/lib/api/search-filters/size";
import filterPrice from "@/lib/api/search-filters/price";
import filterIds from "@/lib/api/search-filters/ids";
import filterTags from "@/lib/api/search-filters/tags";
import sortCombos from "@/lib/api/sort-combos";
import parseQuery from "@/lib/api/parse-query";
import validateSearchParams from "@/lib/api/validate-search-params";

jest.mock("@/lib/api/spellbook-api");
jest.mock("@/lib/api/search-filters/color-identity");
jest.mock("@/lib/api/search-filters/combo-data");
jest.mock("@/lib/api/search-filters/size");
jest.mock("@/lib/api/search-filters/price");
jest.mock("@/lib/api/search-filters/ids");
jest.mock("@/lib/api/search-filters/tags");
jest.mock("@/lib/api/sort-combos");
jest.mock("@/lib/api/parse-query");
jest.mock("@/lib/api/validate-search-params");

describe("search", () => {
  beforeEach(() => {
    const combo = makeFakeCombo({
      commanderSpellbookId: "1",
      cards: ["Card 1", "Card 2"],
      colorIdentity: "r,g",
      prerequisites: ["Step 1. Step 2"],
      steps: ["Step 1. Step 2"],
      results: ["Step 1. Step 2"],
    });
    mocked(lookup).mockResolvedValue([combo]);

    mocked(parseQuery).mockReturnValue(makeSearchParams());
    mocked(filterColorIdentity).mockReturnValue([combo]);
    mocked(filterComboData).mockReturnValue([combo]);
    mocked(filterSize).mockReturnValue([combo]);
    mocked(filterPrice).mockReturnValue([combo]);
    mocked(filterIds).mockReturnValue([combo]);
    mocked(filterTags).mockReturnValue([combo]);
    mocked(sortCombos).mockReturnValue([combo]);
    mocked(validateSearchParams).mockReturnValue(true);
  });

  it("looks up combos from api", async () => {
    await search("card");

    expect(lookup).toBeCalledTimes(1);
  });

  it("does not look up combos if search params are not valid", async () => {
    mocked(validateSearchParams).mockReturnValue(false);

    const result = await search("card");

    expect(lookup).not.toBeCalled();

    expect(result.combos.length).toBe(0);
    expect(result.message).toBe("No valid search parameters submitted");
  });

  it("includes errors when search params are not valid", async () => {
    mocked(validateSearchParams).mockReturnValue(false);
    mocked(parseQuery).mockReturnValue(
      makeSearchParams({
        errors: [
          {
            key: "unknownkey",
            value: "value",
            message: 'Could not parse keyword "unknownkey" with value "value"',
          },
          {
            key: "unknownkey2",
            value: "value2",
            message:
              'Could not parse keyword "unknownkey2" with value "value2"',
          },
        ],
      })
    );

    const result = await search("card");

    expect(lookup).not.toBeCalled();

    expect(result.combos.length).toBe(0);
    expect(result.message).toBe("No valid search parameters submitted");
    expect(result.errors[1].key).toBe("unknownkey2");
  });

  it("filters by ids", async () => {
    await search("Sydri Arjun Rashmi");

    expect(filterIds).toBeCalledTimes(1);
  });

  it("filters by color identity", async () => {
    await search("Sydri Arjun Rashmi");

    expect(filterColorIdentity).toBeCalledTimes(1);
  });

  it("filters by combo data", async () => {
    await search("Sydri Arjun Rashmi");

    expect(filterComboData).toBeCalledTimes(1);
  });

  it("filters by size", async () => {
    await search("Sydri Arjun Rashmi");

    expect(filterSize).toBeCalledTimes(1);
  });

  it("filters by price", async () => {
    await search("Sydri Arjun Rashmi");

    expect(filterPrice).toBeCalledTimes(1);
  });

  it("filters by tags", async () => {
    await search("Sydri Arjun Rashmi");

    expect(filterTags).toBeCalledTimes(1);
  });

  it("sorts by popularity in auto order by default", async () => {
    const result = await search("Sydri Arjun Rashmi");

    expect(sortCombos).toBeCalledTimes(1);
    expect(sortCombos).toBeCalledWith(expect.anything(), {
      by: "popularity",
      order: "auto",
      vendor: "cardkingdom",
    });

    expect(result.sort).toBe("popularity");
    expect(result.order).toBe("auto");
  });

  it("specifies cardkingdom as default vendor", async () => {
    mocked(parseQuery).mockReturnValue(
      makeSearchParams({
        sort: "price",
        order: "descending",
      })
    );
    const result = await search("Sydri Arjun Rashmi");

    expect(sortCombos).toBeCalledTimes(1);
    expect(sortCombos).toBeCalledWith(expect.anything(), {
      by: "price",
      order: "descending",
      vendor: "cardkingdom",
    });

    expect(result.sort).toBe("price");
    expect(result.order).toBe("descending");
    expect(result.vendor).toBe("cardkingdom");

    mocked(sortCombos).mockClear();

    mocked(parseQuery).mockReturnValue(
      makeSearchParams({
        sort: "price",
        order: "descending",
        price: {
          vendor: "tcgplayer",
          filters: [],
        },
      })
    );
    const newResult = await search("Sydri Arjun Rashmi");

    expect(sortCombos).toBeCalledTimes(1);
    expect(sortCombos).toBeCalledWith(expect.anything(), {
      by: "price",
      order: "descending",
      vendor: "tcgplayer",
    });

    expect(newResult.vendor).toBe("tcgplayer");
  });

  it("can sort by specific attributes and order in descending order", async () => {
    mocked(parseQuery).mockReturnValue(
      makeSearchParams({
        sort: "cards",
        order: "descending",
      })
    );

    const result = await search("Sydri Arjun Rashmi");

    expect(sortCombos).toBeCalledTimes(1);
    expect(sortCombos).toBeCalledWith(expect.anything(), {
      by: "cards",
      order: "descending",
      vendor: "cardkingdom",
    });

    expect(result.sort).toBe("cards");
    expect(result.order).toBe("descending");
  });

  it("includes errors", async () => {
    mocked(parseQuery).mockReturnValue(
      makeSearchParams({
        errors: [
          {
            key: "unknownkey",
            value: "value",
            message: 'Could not parse keyword "unknownkey" with value "value"',
          },
          {
            key: "unknownkey2",
            value: "value2",
            message:
              'Could not parse keyword "unknownkey2" with value "value2"',
          },
        ],
      })
    );
    const result = await search(
      "unknownkey:value card:sydri unknownkey2:value2"
    );

    expect(result.errors).toEqual([
      {
        key: "unknownkey",
        value: "value",
        message: 'Could not parse keyword "unknownkey" with value "value"',
      },
      {
        key: "unknownkey2",
        value: "value2",
        message: 'Could not parse keyword "unknownkey2" with value "value2"',
      },
    ]);
  });
});
