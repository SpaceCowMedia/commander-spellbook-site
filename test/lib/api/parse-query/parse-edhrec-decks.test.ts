import parseEDHRECDecks from "@/lib/api/parse-query/parse-edhrec-decks";
import type { SearchParameters } from "@/lib/api/types";
import { makeSearchParams } from "../helper";

describe("parseEDHRECDecks", () => {
  let searchParams: SearchParameters;

  beforeEach(() => {
    searchParams = makeSearchParams();
  });

  it("gives error when : operator is used", () => {
    parseEDHRECDecks(searchParams, "decks", ":", "4");

    expect(searchParams.errors.length).toBe(1);
    expect(searchParams.errors[0]).toEqual({
      key: "decks",
      value: "4",
      message: 'The key "decks" does not support operator ":".',
    });
  });

  it("gives error when non-number value is passed", () => {
    parseEDHRECDecks(searchParams, "decks", "=", "not a number");

    expect(searchParams.errors.length).toBe(1);
    expect(searchParams.errors[0]).toEqual({
      key: "decks",
      value: "not a number",
      message: 'The key "decks" is not compatible with value "not a number".',
    });
  });

  it("gives error when number is less than 0", () => {
    parseEDHRECDecks(searchParams, "decks", "=", "-1");

    expect(searchParams.errors.length).toBe(1);
    expect(searchParams.errors[0]).toEqual({
      key: "decks",
      value: "-1",
      message: 'The key "decks" is not compatible with value "-1".',
    });
  });

  it("adds a size filter", () => {
    parseEDHRECDecks(searchParams, "decks", "=", "4");
    parseEDHRECDecks(searchParams, "decks", ">", "2");

    expect(searchParams.edhrecDecks.sizeFilters.length).toBe(2);
    expect(searchParams.edhrecDecks.sizeFilters[0]).toEqual({
      method: "=",
      value: 4,
    });
    expect(searchParams.edhrecDecks.sizeFilters[1]).toEqual({
      method: ">",
      value: 2,
    });
  });
});
