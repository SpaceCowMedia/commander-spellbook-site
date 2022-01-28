import { makeSearchParams } from "../helper";
import filterColorIdentity from "@/lib/api/search-filters/color-identity";
import makeFakeCombo from "@/lib/api/make-fake-combo";

import type { FormattedApiResponse, SearchParameters } from "@/lib/api/types";

describe("colorIdentityFilter", () => {
  let combos: FormattedApiResponse[];
  let params: SearchParameters;

  beforeEach(() => {
    combos = [makeFakeCombo({ commanderSpellbookId: "1" })];
    params = makeSearchParams();
  });

  describe("color filter", () => {
    it("can filter by color identity array with : operator", () => {
      jest.spyOn(combos[0].colorIdentity, "isWithin").mockReturnValue(true);
      jest.spyOn(combos[0].colorIdentity, "is");

      params.colorIdentity.includeFilters.push({
        method: ":",
        value: ["g", "r", "w"],
      });

      let result = filterColorIdentity(combos, params);

      expect(combos[0].colorIdentity.isWithin).toBeCalledTimes(1);
      expect(combos[0].colorIdentity.isWithin).toBeCalledWith(["g", "r", "w"]);
      expect(combos[0].colorIdentity.is).not.toBeCalled();

      expect(result.length).toBe(1);

      jest.spyOn(combos[0].colorIdentity, "isWithin").mockReturnValue(false);

      result = filterColorIdentity(combos, params);
      expect(result.length).toBe(0);
    });

    it("can filter by color identity array with >= operator", () => {
      jest.spyOn(combos[0].colorIdentity, "includes").mockReturnValue(true);

      params.colorIdentity.includeFilters.push({
        method: ">=",
        value: ["g", "r", "w"],
      });
      let result = filterColorIdentity(combos, params);

      expect(combos[0].colorIdentity.includes).toBeCalledTimes(1);
      expect(combos[0].colorIdentity.includes).toBeCalledWith(["g", "r", "w"]);

      expect(result.length).toBe(1);

      jest.mocked(combos[0].colorIdentity.includes).mockReturnValue(false);

      result = filterColorIdentity(combos, params);
      expect(result.length).toBe(0);
    });

    it("can filter by color identity array with > operator", () => {
      jest.spyOn(combos[0].colorIdentity, "includes").mockReturnValue(true);
      jest.spyOn(combos[0].colorIdentity, "is").mockReturnValue(false);

      params.colorIdentity.includeFilters.push({
        method: ">",
        value: ["g", "r", "w"],
      });
      let result = filterColorIdentity(combos, params);

      expect(combos[0].colorIdentity.includes).toBeCalledTimes(1);
      expect(combos[0].colorIdentity.includes).toBeCalledWith(["g", "r", "w"]);
      expect(combos[0].colorIdentity.is).toBeCalledTimes(1);
      expect(combos[0].colorIdentity.is).toBeCalledWith(["g", "r", "w"]);

      expect(result.length).toBe(1);

      jest.mocked(combos[0].colorIdentity.includes).mockReturnValue(false);
      jest.mocked(combos[0].colorIdentity.is).mockReturnValue(false);

      result = filterColorIdentity(combos, params);
      expect(result.length).toBe(0);
    });

    it("can filter by color identity array with < operator", () => {
      jest.spyOn(combos[0].colorIdentity, "isWithin").mockReturnValue(true);
      jest.spyOn(combos[0].colorIdentity, "is").mockReturnValue(false);

      params.colorIdentity.includeFilters.push({
        method: "<",
        value: ["g", "r", "w"],
      });
      let result = filterColorIdentity(combos, params);

      expect(combos[0].colorIdentity.isWithin).toBeCalledTimes(1);
      expect(combos[0].colorIdentity.isWithin).toBeCalledWith(["g", "r", "w"]);
      expect(combos[0].colorIdentity.is).toBeCalledTimes(1);
      expect(combos[0].colorIdentity.is).toBeCalledWith(["g", "r", "w"]);

      expect(result.length).toBe(1);

      jest.mocked(combos[0].colorIdentity.isWithin).mockReturnValue(false);
      jest.mocked(combos[0].colorIdentity.is).mockReturnValue(false);

      result = filterColorIdentity(combos, params);
      expect(result.length).toBe(0);
    });

    it("can filter by color identity array with <= operator", () => {
      jest.spyOn(combos[0].colorIdentity, "isWithin").mockReturnValue(true);

      params.colorIdentity.includeFilters.push({
        method: "<=",
        value: ["g", "r", "w"],
      });
      let result = filterColorIdentity(combos, params);

      expect(combos[0].colorIdentity.isWithin).toBeCalledTimes(1);
      expect(combos[0].colorIdentity.isWithin).toBeCalledWith(["g", "r", "w"]);

      expect(result.length).toBe(1);

      jest.mocked(combos[0].colorIdentity.isWithin).mockReturnValue(false);

      result = filterColorIdentity(combos, params);
      expect(result.length).toBe(0);
    });

    it("can filter by color identity array with = operator", () => {
      jest.spyOn(combos[0].colorIdentity, "is").mockReturnValue(true);

      params.colorIdentity.includeFilters.push({
        method: "=",
        value: ["g", "r", "w"],
      });
      let result = filterColorIdentity(combos, params);

      expect(combos[0].colorIdentity.is).toBeCalledTimes(1);
      expect(combos[0].colorIdentity.is).toBeCalledWith(["g", "r", "w"]);

      expect(result.length).toBe(1);

      jest.mocked(combos[0].colorIdentity.is).mockReturnValue(false);

      result = filterColorIdentity(combos, params);
      expect(result.length).toBe(0);
    });
  });

  describe("negative color filter", () => {
    it("can filter out color identity array with : operator", () => {
      jest.spyOn(combos[0].colorIdentity, "isWithin").mockReturnValue(true);
      jest.spyOn(combos[0].colorIdentity, "is");

      params.colorIdentity.excludeFilters.push({
        method: ":",
        value: ["g", "r", "w"],
      });

      let result = filterColorIdentity(combos, params);

      expect(combos[0].colorIdentity.isWithin).toBeCalledTimes(1);
      expect(combos[0].colorIdentity.isWithin).toBeCalledWith(["g", "r", "w"]);
      expect(combos[0].colorIdentity.is).not.toBeCalled();

      expect(result.length).toBe(0);

      jest.spyOn(combos[0].colorIdentity, "isWithin").mockReturnValue(false);

      result = filterColorIdentity(combos, params);
      expect(result.length).toBe(1);
    });

    it("can filter out color identity array with >= operator", () => {
      jest.spyOn(combos[0].colorIdentity, "includes").mockReturnValue(true);

      params.colorIdentity.excludeFilters.push({
        method: ">=",
        value: ["g", "r", "w"],
      });
      let result = filterColorIdentity(combos, params);

      expect(combos[0].colorIdentity.includes).toBeCalledTimes(1);
      expect(combos[0].colorIdentity.includes).toBeCalledWith(["g", "r", "w"]);

      expect(result.length).toBe(0);

      jest.mocked(combos[0].colorIdentity.includes).mockReturnValue(false);

      result = filterColorIdentity(combos, params);
      expect(result.length).toBe(1);
    });

    it("can filter out color identity array with > operator", () => {
      jest.spyOn(combos[0].colorIdentity, "includes").mockReturnValue(true);
      jest.spyOn(combos[0].colorIdentity, "is").mockReturnValue(false);

      params.colorIdentity.excludeFilters.push({
        method: ">",
        value: ["g", "r", "w"],
      });
      let result = filterColorIdentity(combos, params);

      expect(combos[0].colorIdentity.includes).toBeCalledTimes(1);
      expect(combos[0].colorIdentity.includes).toBeCalledWith(["g", "r", "w"]);
      expect(combos[0].colorIdentity.is).toBeCalledTimes(1);
      expect(combos[0].colorIdentity.is).toBeCalledWith(["g", "r", "w"]);

      expect(result.length).toBe(0);

      jest.mocked(combos[0].colorIdentity.includes).mockReturnValue(false);
      jest.mocked(combos[0].colorIdentity.is).mockReturnValue(false);

      result = filterColorIdentity(combos, params);
      expect(result.length).toBe(1);
    });

    it("can filter out color identity array with < operator", () => {
      jest.spyOn(combos[0].colorIdentity, "isWithin").mockReturnValue(true);
      jest.spyOn(combos[0].colorIdentity, "is").mockReturnValue(false);

      params.colorIdentity.excludeFilters.push({
        method: "<",
        value: ["g", "r", "w"],
      });
      let result = filterColorIdentity(combos, params);

      expect(combos[0].colorIdentity.isWithin).toBeCalledTimes(1);
      expect(combos[0].colorIdentity.isWithin).toBeCalledWith(["g", "r", "w"]);
      expect(combos[0].colorIdentity.is).toBeCalledTimes(1);
      expect(combos[0].colorIdentity.is).toBeCalledWith(["g", "r", "w"]);

      expect(result.length).toBe(0);

      jest.mocked(combos[0].colorIdentity.isWithin).mockReturnValue(false);
      jest.mocked(combos[0].colorIdentity.is).mockReturnValue(false);

      result = filterColorIdentity(combos, params);
      expect(result.length).toBe(1);
    });

    it("can filter out color identity array with <= operator", () => {
      jest.spyOn(combos[0].colorIdentity, "isWithin").mockReturnValue(true);

      params.colorIdentity.excludeFilters.push({
        method: "<=",
        value: ["g", "r", "w"],
      });
      let result = filterColorIdentity(combos, params);

      expect(combos[0].colorIdentity.isWithin).toBeCalledTimes(1);
      expect(combos[0].colorIdentity.isWithin).toBeCalledWith(["g", "r", "w"]);

      expect(result.length).toBe(0);

      jest.mocked(combos[0].colorIdentity.isWithin).mockReturnValue(false);

      result = filterColorIdentity(combos, params);
      expect(result.length).toBe(1);
    });

    it("can filter out color identity array with = operator", () => {
      jest.spyOn(combos[0].colorIdentity, "is").mockReturnValue(true);

      params.colorIdentity.excludeFilters.push({
        method: "=",
        value: ["g", "r", "w"],
      });
      let result = filterColorIdentity(combos, params);

      expect(combos[0].colorIdentity.is).toBeCalledTimes(1);
      expect(combos[0].colorIdentity.is).toBeCalledWith(["g", "r", "w"]);

      expect(result.length).toBe(0);

      jest.mocked(combos[0].colorIdentity.is).mockReturnValue(false);

      result = filterColorIdentity(combos, params);
      expect(result.length).toBe(1);
    });
  });
});
