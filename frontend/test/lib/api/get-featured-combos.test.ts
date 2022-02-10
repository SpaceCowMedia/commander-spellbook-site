import getFeaturedCombos from "@/lib/api/get-featured-combos";
import CardGrouping from "@/lib/api/models/card-grouping";
import lookup from "@/lib/api/spellbook-api";
import sortCombos from "@/lib/api/sort-combos";
import makeFakeCombo from "@/lib/api/make-fake-combo";

jest.mock("@/lib/api/spellbook-api");
jest.mock("@/lib/api/sort-combos");

describe("getFeaturedCombos", () => {
  it("looks up featured combos from api", async () => {
    const combos = [makeFakeCombo(), makeFakeCombo()];
    jest.mocked(lookup).mockResolvedValue(combos);
    jest.mocked(sortCombos).mockImplementation((combos) => {
      return combos;
    });
    const spy = jest.spyOn(CardGrouping.prototype, "isFeatured");
    spy.mockReturnValueOnce(false);
    spy.mockReturnValueOnce(true);

    const result = await getFeaturedCombos();

    expect(lookup).toBeCalledTimes(1);

    expect(result.length).toBe(1);
    expect(result[0]).toBe(combos[1]);
  });

  it("sorts combos by popularity", async () => {
    const combos = [makeFakeCombo(), makeFakeCombo()];
    jest.mocked(lookup).mockResolvedValue(combos);
    jest.mocked(sortCombos).mockReturnValue(combos);
    const spy = jest.spyOn(CardGrouping.prototype, "isFeatured");
    spy.mockReturnValue(true);

    await getFeaturedCombos();

    expect(sortCombos).toBeCalledTimes(1);

    expect(sortCombos).toBeCalledWith(combos, {
      by: "popularity",
      order: "descending",
      vendor: "cardkingdom",
    });
  });
});
