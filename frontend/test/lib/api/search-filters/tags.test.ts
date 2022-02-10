import { makeSearchParams } from "../helper";
import filterTags from "@/lib/api/search-filters/tags";
import makeFakeCombo from "@/lib/api/make-fake-combo";
import type { FormattedApiResponse, SearchParameters } from "@/lib/api/types";

describe("filterTags", () => {
  let combos: FormattedApiResponse[];
  let params: SearchParameters;

  beforeEach(() => {
    combos = [makeFakeCombo({ commanderSpellbookId: "normal-combo-id" })];
    params = makeSearchParams();
  });

  it("defaults banned combos to be excluded", () => {
    combos.push(
      makeFakeCombo({
        commanderSpellbookId: "banned-combo-id",
        hasBannedCard: true,
      })
    );

    const result = filterTags(combos, params);

    expect(result.length).toBe(1);
    expect(result[0].commanderSpellbookId).toBe("normal-combo-id");
  });

  it("can include banned combos", () => {
    combos.push(
      makeFakeCombo({
        commanderSpellbookId: "banned-combo-id",
        hasBannedCard: true,
      })
    );
    params.tags.banned = "include";

    const result = filterTags(combos, params);

    expect(result.length).toBe(2);
    expect(result[0].commanderSpellbookId).toBe("normal-combo-id");
    expect(result[1].commanderSpellbookId).toBe("banned-combo-id");
  });

  it("can require banned combos", () => {
    combos.push(
      makeFakeCombo({
        commanderSpellbookId: "banned-combo-id",
        hasBannedCard: true,
      })
    );
    params.tags.banned = "is";

    const result = filterTags(combos, params);

    expect(result.length).toBe(1);
    expect(result[0].commanderSpellbookId).toBe("banned-combo-id");
  });

  it("defaults spoiled combos to be included", () => {
    combos.push(
      makeFakeCombo({
        commanderSpellbookId: "spoiled-combo-id",
        hasSpoiledCard: true,
      })
    );

    const result = filterTags(combos, params);

    expect(result.length).toBe(2);
    expect(result[0].commanderSpellbookId).toBe("normal-combo-id");
    expect(result[1].commanderSpellbookId).toBe("spoiled-combo-id");
  });

  it("can exclude spoiled combos", () => {
    combos.push(
      makeFakeCombo({
        commanderSpellbookId: "spoiled-combo-id",
        hasSpoiledCard: true,
      })
    );
    params.tags.spoiled = "exclude";

    const result = filterTags(combos, params);

    expect(result.length).toBe(1);
    expect(result[0].commanderSpellbookId).toBe("normal-combo-id");
  });

  it("can require spoiled combos", () => {
    combos.push(
      makeFakeCombo({
        commanderSpellbookId: "spoiled-combo-id",
        hasSpoiledCard: true,
      })
    );
    params.tags.spoiled = "is";

    const result = filterTags(combos, params);

    expect(result.length).toBe(1);
    expect(result[0].commanderSpellbookId).toBe("spoiled-combo-id");
  });

  it("can require banned and spoiled combos", () => {
    combos.push(
      makeFakeCombo({
        commanderSpellbookId: "just-banned-combo-id",
        hasBannedCard: true,
      }),
      makeFakeCombo({
        commanderSpellbookId: "just-spoiled-combo-id",
        hasSpoiledCard: true,
      }),
      makeFakeCombo({
        commanderSpellbookId: "both-spoiled-and-banned-combo-id",
        hasBannedCard: true,
        hasSpoiledCard: true,
      })
    );
    params.tags.banned = "is";
    params.tags.spoiled = "is";

    const result = filterTags(combos, params);

    expect(result.length).toBe(1);
    expect(result[0].commanderSpellbookId).toBe(
      "both-spoiled-and-banned-combo-id"
    );
  });
});
