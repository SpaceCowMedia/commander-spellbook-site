import createMessage, {
  DATA_TYPES,
} from "@/lib/api/parse-query/create-message";
import makeFakeCombo from "@/lib/api/make-fake-combo";
import type { SearchParameters, FormattedApiResponse } from "@/lib/api/types";
import { makeSearchParams } from "../helper";

describe("createMessage", () => {
  let combos: FormattedApiResponse[];
  let searchParams: SearchParameters;

  beforeEach(() => {
    combos = [makeFakeCombo()];
    searchParams = makeSearchParams();
  });

  it("adds number combos to font of message", () => {
    expect(createMessage(combos, searchParams)).toMatch(/^1 combo where/);

    combos.push(makeFakeCombo(), makeFakeCombo(), makeFakeCombo());

    expect(createMessage(combos, searchParams)).toMatch(/^4 combos where/);
  });

  it("includes ids used in query", () => {
    searchParams.id.includeFilters.push("1", "2");

    expect(createMessage(combos, searchParams)).toContain(
      'the id is "1" and the id is "2"'
    );
  });

  it("includes -ids used in query", () => {
    searchParams.id.excludeFilters.push("1", "2");

    expect(createMessage(combos, searchParams)).toContain(
      'the id is not "1" and the id is not "2"'
    );
  });

  describe.each(DATA_TYPES)("%s", (dataType) => {
    it(`creates a message for number of ${dataType}`, () => {
      searchParams[dataType].sizeFilters.push(
        {
          method: ">",
          value: 5,
        },
        {
          method: "=",
          value: 4,
        },
        {
          method: "<=",
          value: 2,
        }
      );

      const message = createMessage(combos, searchParams);

      expect(message).toContain(
        `the number of ${dataType} in the combo is greater than 5 and the number of ${dataType} in the combo is 4 and the number of ${dataType} in the combo is less than or equal to 2`
      );
    });

    it(`creates a message for data included in ${dataType}`, () => {
      searchParams[dataType].includeFilters.push(
        {
          method: ":",
          value: "data 1",
        },
        {
          method: "=",
          value: "data 2",
        },
        {
          method: ":",
          value: 'data with "quotes"',
        }
      );

      const message = createMessage(combos, searchParams);

      expect(message).toContain(
        `${dataType} have a value containing "data 1" and ${dataType} have a value of exactly "data 2" and ${dataType} have a value containing "data with \\"quotes\\""`
      );
    });

    it(`creates a message for data excluded from ${dataType}`, () => {
      searchParams[dataType].excludeFilters.push(
        {
          method: ":",
          value: "data 1",
        },
        {
          method: "=",
          value: "data 2",
        },
        {
          method: ":",
          value: 'data with "quotes"',
        }
      );

      const message = createMessage(combos, searchParams);

      expect(message).toContain(
        `${dataType} do not have a value containing "data 1" and ${dataType} do not have a value of exactly "data 2" and ${dataType} do not have a value containing "data with \\"quotes\\""`
      );
    });
  });

  describe("color identity", () => {
    it("creates a message for number of colors", () => {
      searchParams.colorIdentity.sizeFilters.push(
        {
          method: ">",
          value: 5,
        },
        {
          method: "=",
          value: 4,
        },
        {
          method: "<=",
          value: 2,
        }
      );

      const message = createMessage(combos, searchParams);

      expect(message).toContain(
        "the number of colors in the combo is greater than 5 and the number of colors in the combo is 4 and the number of colors in the combo is less than or equal to 2"
      );
    });

    it("creates a message for data included in color identity", () => {
      searchParams.colorIdentity.includeFilters.push(
        {
          method: ":",
          value: ["w", "b"],
        },
        {
          method: "=",
          value: ["r", "b", "w"],
        },
        {
          method: ">",
          value: ["r", "b"],
        }
      );

      const message = createMessage(combos, searchParams);

      expect(message).toContain(
        `the color identity for the combo is within "wb" and the color identity for the combo is exactly "rbw" and the color identity for the combo is greater than "rb".`
      );
    });

    it("creates a message for data excluded from colors", () => {
      searchParams.colorIdentity.excludeFilters.push(
        {
          method: ":",
          value: ["w", "b"],
        },
        {
          method: "=",
          value: ["r", "b", "w"],
        },
        {
          method: ">",
          value: ["r", "b"],
        }
      );

      const message = createMessage(combos, searchParams);

      expect(message).toContain(
        `the color identity for the combo is not within "wb" and the color identity for the combo is not exactly "rbw" and the color identity for the combo is not greater than "rb".`
      );
    });
  });

  describe("edhrecDecks", () => {
    it.each`
      method  | text
      ${"="}  | ${"is"}
      ${">"}  | ${"is greater than"}
      ${"<"}  | ${"is less than"}
      ${">="} | ${"is greater than or equal to"}
      ${"<="} | ${"is less than or equal to"}
    `(
      "creates a message for searches that include decks using the %method operator",
      ({ method, text }) => {
        searchParams.edhrecDecks.sizeFilters.push({
          method,
          value: 5,
        });

        const message = createMessage(combos, searchParams);

        expect(message).toContain(
          `where the number of decks running the combo according to EDHREC ${text} 5`
        );
      }
    );
  });

  describe("tags", () => {
    it("creates a message for searches that include banned cards", () => {
      searchParams.tags.banned = "include";

      const message = createMessage(combos, searchParams);

      expect(message).toContain("including combos with banned cards");
    });

    it("creates a message for searches that exclude banned cards", () => {
      searchParams.tags.banned = "exclude";

      const message = createMessage(combos, searchParams);

      expect(message).toContain("excluding combos with banned cards");
    });

    it("creates a message for searches that have a banned card", () => {
      searchParams.tags.banned = "is";

      const message = createMessage(combos, searchParams);

      expect(message).toContain("at least one card is banned in commander");
    });

    it("creates a message for searches that have a no banned cards", () => {
      searchParams.tags.banned = "not";

      const message = createMessage(combos, searchParams);

      expect(message).toContain("no cards are banned in commaander");
    });

    it("creates a message for searches that include spoiled cards", () => {
      searchParams.tags.spoiled = "include";

      const message = createMessage(combos, searchParams);

      expect(message).toContain(
        "including combos with cards that are not yet released"
      );
    });

    it("creates a message for searches that exclude spoiled cards", () => {
      searchParams.tags.spoiled = "exclude";

      const message = createMessage(combos, searchParams);

      expect(message).toContain(
        "excluding combos with cards that are not yet released"
      );
    });

    it("creates a message for searches that have a spoiled card", () => {
      searchParams.tags.spoiled = "is";

      const message = createMessage(combos, searchParams);

      expect(message).toContain("at least one card is not yet released");
    });

    it("creates a message for searches that have a no spoiled cards", () => {
      searchParams.tags.spoiled = "not";

      const message = createMessage(combos, searchParams);

      expect(message).toContain("all cards have been released");
    });
  });
});
