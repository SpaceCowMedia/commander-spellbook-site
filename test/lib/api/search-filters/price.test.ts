import { mocked } from "ts-jest/utils";
import { makeSearchParams } from "../helper";
import filterPrice from "@/lib/api/search-filters/price";
import makeFakeCombo from "@/lib/api/make-fake-combo";

import type { FormattedApiResponse, SearchParameters } from "@/lib/api/types";

describe("priceFilter", () => {
  let combos: FormattedApiResponse[];
  let params: SearchParameters;

  beforeEach(() => {
    combos = [makeFakeCombo()];
    params = makeSearchParams();

    jest.spyOn(combos[0].cards, "getPrice");
  });

  it.each([":", "="])("can filter price using %s", async (operator) => {
    params.price.filters.push({
      method: operator,
      value: 3,
    });
    mocked(combos[0].cards.getPrice).mockReturnValue(3);

    let result = await filterPrice(combos, params);
    expect(result.length).toBe(1);

    mocked(combos[0].cards.getPrice).mockReturnValue(2);

    result = filterPrice(combos, params);
    expect(result.length).toBe(0);

    mocked(combos[0].cards.getPrice).mockReturnValue(4);

    result = filterPrice(combos, params);
    expect(result.length).toBe(0);
  });

  it("can filter by number of values using >", () => {
    mocked(combos[0].cards.getPrice).mockReturnValue(4);

    params.price.filters.push({
      method: ">",
      value: 3,
    });

    let result = filterPrice(combos, params);
    expect(result.length).toBe(1);

    mocked(combos[0].cards.getPrice).mockReturnValue(3);

    result = filterPrice(combos, params);
    expect(result.length).toBe(0);

    mocked(combos[0].cards.getPrice).mockReturnValue(2);

    result = filterPrice(combos, params);
    expect(result.length).toBe(0);
  });

  it("can filter by number of values using >=", () => {
    mocked(combos[0].cards.getPrice).mockReturnValue(4);

    params.price.filters.push({
      method: ">=",
      value: 3,
    });

    let result = filterPrice(combos, params);
    expect(result.length).toBe(1);

    mocked(combos[0].cards.getPrice).mockReturnValue(3);

    result = filterPrice(combos, params);
    expect(result.length).toBe(1);

    mocked(combos[0].cards.getPrice).mockReturnValue(2);

    result = filterPrice(combos, params);
    expect(result.length).toBe(0);
  });

  it("can filter by number of values using <", () => {
    mocked(combos[0].cards.getPrice).mockReturnValue(2);

    params.price.filters.push({
      method: "<",
      value: 3,
    });

    let result = filterPrice(combos, params);
    expect(result.length).toBe(1);

    mocked(combos[0].cards.getPrice).mockReturnValue(3);

    result = filterPrice(combos, params);
    expect(result.length).toBe(0);

    mocked(combos[0].cards.getPrice).mockReturnValue(4);

    result = filterPrice(combos, params);
    expect(result.length).toBe(0);
  });

  it("can filter by number of values using <=", () => {
    mocked(combos[0].cards.getPrice).mockReturnValue(2);

    params.price.filters.push({
      method: "<=",
      value: 3,
    });

    let result = filterPrice(combos, params);
    expect(result.length).toBe(1);

    mocked(combos[0].cards.getPrice).mockReturnValue(3);

    result = filterPrice(combos, params);
    expect(result.length).toBe(1);

    mocked(combos[0].cards.getPrice).mockReturnValue(4);

    result = filterPrice(combos, params);
    expect(result.length).toBe(0);
  });

  it("filters out combos with a price of 0, even if it would match method", () => {
    mocked(combos[0].cards.getPrice).mockReturnValue(2);

    params.price.filters.push({
      method: "<=",
      value: 3,
    });

    let result = filterPrice(combos, params);
    expect(result.length).toBe(1);

    mocked(combos[0].cards.getPrice).mockReturnValue(0);

    result = filterPrice(combos, params);
    expect(result.length).toBe(0);
  });

  it("defaults vendor to cardkingdom", () => {
    params.price.filters.push({
      method: "<=",
      value: 3,
    });

    filterPrice(combos, params);

    expect(combos[0].cards.getPrice).toBeCalledWith("cardkingdom");
  });

  it("can pass a vendor", () => {
    params.price.vendor = "tcgplayer";
    params.price.filters.push({
      method: "<=",
      value: 3,
    });

    filterPrice(combos, params);

    expect(combos[0].cards.getPrice).toBeCalledWith("tcgplayer");
  });
});
