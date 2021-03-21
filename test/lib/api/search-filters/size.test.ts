import filterSize, {
  SIZE_RESTRICTED_FILTERS,
} from "@/lib/api/search-filters/size";
import makeFakeCombo from "@/lib/api/make-fake-combo";

import { mocked } from "ts-jest/utils";

import type { FormattedApiResponse, SearchParameters } from "@/lib/api/types";
import { makeSearchParams } from "../helper";

describe("sizeFilter", () => {
  let combos: FormattedApiResponse[];
  let params: SearchParameters;

  beforeEach(() => {
    combos = [makeFakeCombo()];
    params = makeSearchParams();
  });

  describe.each(SIZE_RESTRICTED_FILTERS)("%s", (dataType) => {
    beforeEach(() => {
      jest.spyOn(combos[0][dataType], "size");
    });

    it.each([":", "="])(
      "can filter by number of values using %s",
      async (operator) => {
        mocked(combos[0][dataType].size).mockReturnValue(3);

        params[dataType].sizeFilters.push({
          method: operator,
          value: 3,
        });

        let result = await filterSize(combos, params);
        expect(result.length).toBe(1);

        mocked(combos[0][dataType].size).mockReturnValue(2);

        result = filterSize(combos, params);
        expect(result.length).toBe(0);

        mocked(combos[0][dataType].size).mockReturnValue(4);

        result = filterSize(combos, params);
        expect(result.length).toBe(0);
      }
    );

    it("can filter by number of values using >", () => {
      mocked(combos[0][dataType].size).mockReturnValue(4);

      params[dataType].sizeFilters.push({
        method: ">",
        value: 3,
      });

      let result = filterSize(combos, params);
      expect(result.length).toBe(1);

      mocked(combos[0][dataType].size).mockReturnValue(3);

      result = filterSize(combos, params);
      expect(result.length).toBe(0);

      mocked(combos[0][dataType].size).mockReturnValue(2);

      result = filterSize(combos, params);
      expect(result.length).toBe(0);
    });

    it("can filter by number of values using >=", () => {
      mocked(combos[0][dataType].size).mockReturnValue(4);

      params[dataType].sizeFilters.push({
        method: ">=",
        value: 3,
      });

      let result = filterSize(combos, params);
      expect(result.length).toBe(1);

      mocked(combos[0][dataType].size).mockReturnValue(3);

      result = filterSize(combos, params);
      expect(result.length).toBe(1);

      mocked(combos[0][dataType].size).mockReturnValue(2);

      result = filterSize(combos, params);
      expect(result.length).toBe(0);
    });

    it("can filter by number of values using <", () => {
      mocked(combos[0][dataType].size).mockReturnValue(2);

      params[dataType].sizeFilters.push({
        method: "<",
        value: 3,
      });

      let result = filterSize(combos, params);
      expect(result.length).toBe(1);

      mocked(combos[0][dataType].size).mockReturnValue(3);

      result = filterSize(combos, params);
      expect(result.length).toBe(0);

      mocked(combos[0][dataType].size).mockReturnValue(4);

      result = filterSize(combos, params);
      expect(result.length).toBe(0);
    });

    it("can filter by number of values using <=", () => {
      mocked(combos[0][dataType].size).mockReturnValue(2);

      params[dataType].sizeFilters.push({
        method: "<=",
        value: 3,
      });

      let result = filterSize(combos, params);
      expect(result.length).toBe(1);

      mocked(combos[0][dataType].size).mockReturnValue(3);

      result = filterSize(combos, params);
      expect(result.length).toBe(1);

      mocked(combos[0][dataType].size).mockReturnValue(4);

      result = filterSize(combos, params);
      expect(result.length).toBe(0);
    });
  });
});
