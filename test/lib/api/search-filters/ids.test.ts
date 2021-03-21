import filterIds from "@/lib/api/search-filters/ids";
import makeFakeCombo from "@/lib/api/make-fake-combo";
import type { FormattedApiResponse, SearchParameters } from "@/lib/api/types";
import { makeSearchParams } from "../helper";

describe("idsFilter", () => {
  let combos: FormattedApiResponse[];
  let params: SearchParameters;

  beforeEach(() => {
    combos = [
      makeFakeCombo({ commanderSpellbookId: "1" }),
      makeFakeCombo({ commanderSpellbookId: "2" }),
      makeFakeCombo({ commanderSpellbookId: "3" }),
    ];
    params = makeSearchParams();
  });

  it("filters by id", () => {
    params.id.includeFilters.push("2");

    const combosWithId = filterIds(combos, params);

    expect(combosWithId.length).toBe(1);
    expect(combosWithId[0].commanderSpellbookId).toBe("2");
  });

  it("ignores id filter and passes error when more than one id is passed", () => {
    params.id.includeFilters.push("1", "2");

    const results = filterIds(combos, params);

    expect(results.length).toBe(3);
    expect(params.errors.length).toBe(1);
    expect(params.errors[0]).toEqual({
      key: "id",
      value: "1|2",
      message: "Multiple includsive id parameters present (1|2).",
    });
  });

  it("provides error when id does not exist", () => {
    params.id.includeFilters.push("100");

    const results = filterIds(combos, params);

    expect(results.length).toBe(0);
    expect(params.errors.length).toBe(1);
    expect(params.errors[0]).toEqual({
      key: "id",
      value: "100",
      message: 'No combo with id "100" could be found.',
    });
  });

  it("excludes combos with id", () => {
    params.id.excludeFilters.push("1", "3");

    const results = filterIds(combos, params);

    expect(results.length).toBe(1);
    expect(results[0].commanderSpellbookId).toBe("2");
  });
});
