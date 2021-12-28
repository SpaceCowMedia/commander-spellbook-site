import { mocked } from "ts-jest/utils";
import findById from "@/lib/api/find-by-id";
import makeFakeCombo from "@/lib/api/make-fake-combo";
import lookup from "@/lib/api/spellbook-api";

import type { FormattedApiResponse } from "@/lib/api/types";

jest.mock("@/lib/api/spellbook-api");

describe("findById", () => {
  let combos: FormattedApiResponse[];

  beforeEach(() => {
    combos = [
      makeFakeCombo({
        commanderSpellbookId: "1",
        cards: ["Card 1", "Card 2"],
        colorIdentity: "r,g",
        prerequisites: ["Step 1. Step 2"],
        steps: ["Step 1. Step 2"],
        results: ["Step 1. Step 2"],
      }),
      makeFakeCombo({
        commanderSpellbookId: "2",
        cards: ["Card 3", "Card 4"],
        colorIdentity: "w,b,r",
        prerequisites: ["Step 1.", "Step 2"],
        steps: ["Step 1.", "Step 2"],
        results: ["Step 1.", "Step 2"],
      }),
    ];
    mocked(lookup).mockResolvedValue(combos);
  });

  it("returns the specified combo", async () => {
    const combo1 = await findById("1");
    const combo2 = await findById("2");

    expect(combo1).toBe(combos[0]);
    expect(combo2).toBe(combos[1]);
  });

  it("can pass the useGoogleSheetsEndpoint flag", async () => {
    await findById("1");

    expect(lookup).toBeCalledWith(false);

    await findById("2", true);

    expect(lookup).toBeCalledWith(true);
  });

  it("rejects when combo cannot be found", async () => {
    expect.assertions(1);

    try {
      await findById("not-found-id");
    } catch (err) {
      expect(err.message).toBe(
        'Combo with id "not-found-id" could not be found.'
      );
    }
  });
});
