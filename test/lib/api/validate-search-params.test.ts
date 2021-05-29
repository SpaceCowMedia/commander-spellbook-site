import validateSearchParams from "@/lib/api/validate-search-params";
import { makeSearchParams } from "./helper";

describe("validateSearchParams", () => {
  it("returns false when no search params are passed on", () => {
    const params = makeSearchParams();

    expect(validateSearchParams(params)).toBe(false);
  });

  it("returns true when cards have at least one filter", () => {
    expect(
      validateSearchParams(
        makeSearchParams({
          cards: {
            sizeFilters: [{ method: ">", value: 1 }],
            includeFilters: [],
            excludeFilters: [],
          },
        })
      )
    ).toBe(true);
    expect(
      validateSearchParams(
        makeSearchParams({
          cards: {
            sizeFilters: [],
            includeFilters: [{ method: ">", value: "foo" }],
            excludeFilters: [],
          },
        })
      )
    ).toBe(true);
    expect(
      validateSearchParams(
        makeSearchParams({
          cards: {
            sizeFilters: [],
            includeFilters: [],
            excludeFilters: [{ method: ">", value: "foo" }],
          },
        })
      )
    ).toBe(true);
  });

  it("returns true when prerequisites have at least one filter", () => {
    expect(
      validateSearchParams(
        makeSearchParams({
          prerequisites: {
            sizeFilters: [{ method: ">", value: 1 }],
            includeFilters: [],
            excludeFilters: [],
          },
        })
      )
    ).toBe(true);
    expect(
      validateSearchParams(
        makeSearchParams({
          prerequisites: {
            sizeFilters: [],
            includeFilters: [{ method: ">", value: "foo" }],
            excludeFilters: [],
          },
        })
      )
    ).toBe(true);
    expect(
      validateSearchParams(
        makeSearchParams({
          prerequisites: {
            sizeFilters: [],
            includeFilters: [],
            excludeFilters: [{ method: ">", value: "foo" }],
          },
        })
      )
    ).toBe(true);
  });

  it("returns true when steps have at least one filter", () => {
    expect(
      validateSearchParams(
        makeSearchParams({
          steps: {
            sizeFilters: [{ method: ">", value: 1 }],
            includeFilters: [],
            excludeFilters: [],
          },
        })
      )
    ).toBe(true);
    expect(
      validateSearchParams(
        makeSearchParams({
          steps: {
            sizeFilters: [],
            includeFilters: [{ method: ">", value: "foo" }],
            excludeFilters: [],
          },
        })
      )
    ).toBe(true);
    expect(
      validateSearchParams(
        makeSearchParams({
          steps: {
            sizeFilters: [],
            includeFilters: [],
            excludeFilters: [{ method: ">", value: "foo" }],
          },
        })
      )
    ).toBe(true);
  });

  it("returns true when results have at least one filter", () => {
    expect(
      validateSearchParams(
        makeSearchParams({
          results: {
            sizeFilters: [{ method: ">", value: 1 }],
            includeFilters: [],
            excludeFilters: [],
          },
        })
      )
    ).toBe(true);
    expect(
      validateSearchParams(
        makeSearchParams({
          results: {
            sizeFilters: [],
            includeFilters: [{ method: ">", value: "foo" }],
            excludeFilters: [],
          },
        })
      )
    ).toBe(true);
    expect(
      validateSearchParams(
        makeSearchParams({
          results: {
            sizeFilters: [],
            includeFilters: [],
            excludeFilters: [{ method: ">", value: "foo" }],
          },
        })
      )
    ).toBe(true);
  });

  it("returns true when colorIdentity have at least one filter", () => {
    expect(
      validateSearchParams(
        makeSearchParams({
          colorIdentity: {
            sizeFilters: [{ method: ">", value: 1 }],
            includeFilters: [],
            excludeFilters: [],
          },
        })
      )
    ).toBe(true);
    expect(
      validateSearchParams(
        makeSearchParams({
          colorIdentity: {
            sizeFilters: [],
            includeFilters: [{ method: ">", value: ["w"] }],
            excludeFilters: [],
          },
        })
      )
    ).toBe(true);
    expect(
      validateSearchParams(
        makeSearchParams({
          colorIdentity: {
            sizeFilters: [],
            includeFilters: [],
            excludeFilters: [{ method: ">", value: ["w"] }],
          },
        })
      )
    ).toBe(true);
  });

  it("returns true when id has at least one filter", () => {
    expect(
      validateSearchParams(
        makeSearchParams({
          id: {
            includeFilters: ["foo"],
            excludeFilters: [],
          },
        })
      )
    ).toBe(true);
    expect(
      validateSearchParams(
        makeSearchParams({
          id: {
            includeFilters: [],
            excludeFilters: ["foo"],
          },
        })
      )
    ).toBe(true);
  });

  it("returns true when price has at least one filter", () => {
    expect(
      validateSearchParams(
        makeSearchParams({
          price: {
            filters: [
              {
                method: ">",
                value: 1,
              },
            ],
          },
        })
      )
    ).toBe(true);
  });

  it("returns true when tags have at least one value", () => {
    expect(
      validateSearchParams(
        makeSearchParams({
          tags: {
            banned: "is",
          },
        })
      )
    ).toBe(true);
    expect(
      validateSearchParams(
        makeSearchParams({
          tags: {
            spoiled: "include",
          },
        })
      )
    ).toBe(true);
  });
});
