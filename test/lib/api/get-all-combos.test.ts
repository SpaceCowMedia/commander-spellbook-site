import { mocked } from "ts-jest/utils";
import getAllCombos from "@/lib/api/get-all-combos";
import lookup from "@/lib/api/spellbook-api";
import makeFakeCombo from "@/lib/api/make-fake-combo";

import type { FormattedApiResponse } from "@/lib/api/types";

jest.mock("@/lib/api/spellbook-api");

describe("getAllCombos", () => {
  let combos: FormattedApiResponse[];

  beforeEach(() => {
    combos = [makeFakeCombo(), makeFakeCombo()];
    mocked(lookup).mockResolvedValue(combos);
  });

  it("looks up all combos from api", async () => {
    const result = await getAllCombos();

    expect(lookup).toBeCalledTimes(1);

    expect(result).toBe(combos);
  });
});
