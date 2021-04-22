import getFeaturedCombos from "@/lib/api/get-featured-combos";
import CardGrouping from "@/lib/api/models/card-grouping";
import lookup from "@/lib/api/spellbook-api";
import makeFakeCombo from "@/lib/api/make-fake-combo";
import { mocked } from "ts-jest/utils";

jest.mock("@/lib/api/spellbook-api");

describe("getFeaturedCombos", () => {
  it("looks up featured combos from api", async () => {
    const combos = [makeFakeCombo(), makeFakeCombo()];
    mocked(lookup).mockResolvedValue(combos);
    const spy = jest.spyOn(CardGrouping.prototype, "isFeatured");
    spy.mockReturnValueOnce(false);
    spy.mockReturnValueOnce(true);

    const result = await getFeaturedCombos();

    expect(lookup).toBeCalledTimes(1);

    expect(result.length).toBe(1);
    expect(result[0]).toBe(combos[1]);
  });
});
