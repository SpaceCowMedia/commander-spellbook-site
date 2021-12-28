import { mocked } from "ts-jest/utils";
import random from "@/lib/api/random";
import search from "@/lib/api/search";
import getAllCombos from "@/lib/api/get-all-combos";
import makeFakeCombo from "@/lib/api/make-fake-combo";

import type { FormattedApiResponse } from "@/lib/api/types";

jest.mock("@/lib/api/search");
jest.mock("@/lib/api/get-all-combos");

describe("random", () => {
  let combos: FormattedApiResponse[];

  beforeEach(() => {
    combos = [makeFakeCombo(), makeFakeCombo()];
    mocked(search).mockResolvedValue({
      errors: [],
      message: "message",
      vendor: "cardkingdom",
      sort: "colors",
      order: "ascending",
      combos,
    });
    mocked(getAllCombos).mockResolvedValue(combos);
  });

  it("looks up all combos", async () => {
    await random();

    expect(search).toBeCalledTimes(0);
    expect(getAllCombos).toBeCalledTimes(1);
  });

  it("looks up combos from search with a query", async () => {
    await random("query");

    expect(getAllCombos).toBeCalledTimes(0);
    expect(search).toBeCalledTimes(1);
    expect(search).toBeCalledWith("query");
  });

  it("returns a random combo", async () => {
    jest.spyOn(Math, "floor");
    jest.spyOn(Math, "random");

    const combo = await random();

    expect(combos).toContain(combo);
    expect(Math.floor).toBeCalledTimes(1);
    expect(Math.random).toBeCalledTimes(1);
  });

  it("throws an error when no combos can be found", async () => {
    expect.assertions(1);

    mocked(search).mockResolvedValue({
      errors: [],
      message: "message",
      vendor: "cardkingdom",
      sort: "colors",
      order: "ascending",
      combos: [],
    });

    try {
      await random("query");
    } catch (err) {
      expect(err.message).toBe("No combos found for query: query");
    }
  });
});
