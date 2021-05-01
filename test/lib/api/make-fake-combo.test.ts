import makeFakeCombo from "@/lib/api/make-fake-combo";
import CardGrouping from "@/lib/api/models/card-grouping";
import Card from "@/lib/api/models/card";
import SpellbookList from "@/lib/api/models/list";
import ColorIdentity from "@/lib/api/models/color-identity";

describe("makeFakeCombo", () => {
  it("creates a fake combo", () => {
    const combo = makeFakeCombo();

    expect(combo.commanderSpellbookId).toBe("123");
    expect(combo.permalink).toBe("https://commanderspellbook.com/combo/123/");
    expect(combo.edhrecLink).toBe("https://edhrec.com/combos/wub/123");

    expect(combo.cards).toBeInstanceOf(CardGrouping);
    expect(combo.cards.length).toBe(2);
    expect(combo.cards[0]).toBeInstanceOf(Card);
    expect(combo.cards[0].name).toBe("card 1");
    expect(combo.cards[1]).toBeInstanceOf(Card);
    expect(combo.cards[1].name).toBe("card 2");

    expect(combo.colorIdentity).toBeInstanceOf(ColorIdentity);
    expect(combo.colorIdentity.colors).toEqual(["w", "u", "b"]);

    expect(combo.prerequisites).toBeInstanceOf(SpellbookList);
    expect(combo.prerequisites.length).toBe(2);
    expect(combo.prerequisites[0]).toBe("pre 1");
    expect(combo.prerequisites[1]).toBe("pre 2");

    expect(combo.steps).toBeInstanceOf(SpellbookList);
    expect(combo.steps.length).toBe(2);
    expect(combo.steps[0]).toBe("step 1");
    expect(combo.steps[1]).toBe("step 2");

    expect(combo.results).toBeInstanceOf(SpellbookList);
    expect(combo.results.length).toBe(2);
    expect(combo.results[0]).toBe("result 1");
    expect(combo.results[1]).toBe("result 2");
  });

  it("can overwrite the id", () => {
    const combo = makeFakeCombo({
      commanderSpellbookId: "custom-id",
    });

    expect(combo.commanderSpellbookId).toBe("custom-id");
    expect(combo.permalink).toBe(
      "https://commanderspellbook.com/combo/custom-id/"
    );
  });

  it("can overwrite cards", () => {
    const combo = makeFakeCombo({
      cards: ["custom card 1", "custom card 2", "custom card 3"],
    });

    expect(combo.cards).toBeInstanceOf(CardGrouping);
    expect(combo.cards.length).toBe(3);
    expect(combo.cards[0]).toBeInstanceOf(Card);
    expect(combo.cards[0].name).toBe("custom card 1");
    expect(combo.cards[1]).toBeInstanceOf(Card);
    expect(combo.cards[1].name).toBe("custom card 2");
    expect(combo.cards[2]).toBeInstanceOf(Card);
    expect(combo.cards[2].name).toBe("custom card 3");
  });

  it("can overwrite colorIdentity", () => {
    const combo = makeFakeCombo({
      colorIdentity: "ur",
    });

    expect(combo.colorIdentity).toBeInstanceOf(ColorIdentity);
    expect(combo.colorIdentity.colors).toEqual(["u", "r"]);
  });

  it("can overwrite prerequisites", () => {
    const combo = makeFakeCombo({
      prerequisites: ["custom pre 1", "custom pre 2", "custom pre 3"],
    });

    expect(combo.prerequisites).toBeInstanceOf(SpellbookList);
    expect(combo.prerequisites.length).toBe(3);
    expect(combo.prerequisites[0]).toBe("custom pre 1");
    expect(combo.prerequisites[1]).toBe("custom pre 2");
    expect(combo.prerequisites[2]).toBe("custom pre 3");
  });

  it("can overwrite steps", () => {
    const combo = makeFakeCombo({
      steps: ["custom step 1", "custom step 2", "custom step 3"],
    });

    expect(combo.steps).toBeInstanceOf(SpellbookList);
    expect(combo.steps.length).toBe(3);
    expect(combo.steps[0]).toBe("custom step 1");
    expect(combo.steps[1]).toBe("custom step 2");
    expect(combo.steps[2]).toBe("custom step 3");
  });

  it("can overwrite results", () => {
    const combo = makeFakeCombo({
      results: ["custom result 1", "custom result 2", "custom result 3"],
    });

    expect(combo.results).toBeInstanceOf(SpellbookList);
    expect(combo.results.length).toBe(3);
    expect(combo.results[0]).toBe("custom result 1");
    expect(combo.results[1]).toBe("custom result 2");
    expect(combo.results[2]).toBe("custom result 3");
  });

  it("can opt out of an edhrecLink", () => {
    const combo = makeFakeCombo({
      edhrecLink: false,
    });

    expect(combo.edhrecLink).toBeFalsy();
  });
});
