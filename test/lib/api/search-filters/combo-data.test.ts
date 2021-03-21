import filterComboData, {
  DATA_TYPES,
} from "@/lib/api/search-filters/combo-data";
import makeFakeCombo from "@/lib/api/make-fake-combo";

import { mocked } from "ts-jest/utils";

import type { FormattedApiResponse, SearchParameters } from "@/lib/api/types";
import { makeSearchParams } from "../helper";

describe("comboDataFilter", () => {
  let combos: FormattedApiResponse[];
  let params: SearchParameters;

  beforeEach(() => {
    combos = [makeFakeCombo({ commanderSpellbookId: "1" })];
    params = makeSearchParams();
  });

  describe.each(DATA_TYPES)("%s", (dataType) => {
    it(`includes data for ${dataType}`, () => {
      params[dataType].includeFilters.push({
        method: ":",
        value: "data",
      });

      jest.spyOn(combos[0][dataType], "includesValue").mockReturnValue(true);

      let result = filterComboData(combos, params);

      expect(result.length).toBe(1);

      mocked(combos[0][dataType].includesValue).mockReturnValue(false);
      result = filterComboData(combos, params);

      expect(result.length).toBe(0);
    });

    it(`excludes data for ${dataType}`, () => {
      params[dataType].excludeFilters.push({
        method: ":",
        value: "data",
      });

      jest.spyOn(combos[0][dataType], "includesValue").mockReturnValue(false);

      let result = filterComboData(combos, params);

      expect(result.length).toBe(1);

      mocked(combos[0][dataType].includesValue).mockReturnValue(true);
      result = filterComboData(combos, params);

      expect(result.length).toBe(0);
    });
  });
});
