import random from "@/lib/api/random";
import search from "@/lib/api/search";
import getAllCombos from "@/lib/api/get-all-combos";
import makeFakeCombo from "@/lib/api/make-fake-combo";

import type { FormattedApiResponse } from "@/lib/api/types";

import { mocked } from "ts-jest/utils";
jest.mock("@/lib/api/search");
jest.mock("@/lib/api/get-all-combos");

describe("random", () => {
  let combos: FormattedApiResponse[];

  beforeEach(() => {
    combos = [makeFakeCombo(), makeFakeCombo()];
    mocked(search).mockResolvedValue({
      errors: [],
      message: "message",
      sort: "",
      order: "",
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
});
