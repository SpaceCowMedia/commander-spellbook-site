import random from "@/lib/api/random";
import lookup from "@/lib/api/spellbook-api";
import makeFakeCombo from "@/lib/api/make-fake-combo";

import type { FormattedApiResponse } from "@/lib/api/types";

import { mocked } from "ts-jest/utils";
jest.mock("@/lib/api/spellbook-api");

describe("random", () => {
  let combos: FormattedApiResponse[];

  beforeEach(() => {
    combos = [makeFakeCombo(), makeFakeCombo()];
    mocked(lookup).mockResolvedValue(combos);
  });

  it("looks up combos from api", async () => {
    await random();

    expect(lookup).toBeCalledTimes(1);
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
