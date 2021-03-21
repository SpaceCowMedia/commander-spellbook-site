import makeFakeCombo from "@/lib/api/make-fake-combo";
import sortCombos from "@/lib/api/sort-combos";
import COLOR_ORDER from "@/lib/api/color-combo-order";
import { FormattedApiResponse } from "@/lib/api/types";

describe("search", () => {
  let combos: FormattedApiResponse[];

  beforeEach(() => {
    combos = [];
  });

  it("maintains original order when unsupported sort by value is used", async () => {
    combos.push(
      makeFakeCombo({
        commanderSpellbookId: "3",
      }),
      makeFakeCombo({
        commanderSpellbookId: "2",
      }),
      makeFakeCombo({
        commanderSpellbookId: "1",
      }),
      makeFakeCombo({
        commanderSpellbookId: "5",
      }),
      makeFakeCombo({
        commanderSpellbookId: "4",
      })
    );

    const sortedCombos = await sortCombos(combos, "foo", "ascending");

    expect(sortedCombos[0].commanderSpellbookId).toBe("3");
    expect(sortedCombos[1].commanderSpellbookId).toBe("2");
    expect(sortedCombos[2].commanderSpellbookId).toBe("1");
    expect(sortedCombos[3].commanderSpellbookId).toBe("5");
    expect(sortedCombos[4].commanderSpellbookId).toBe("4");
  });

  it("sorts combos by id", async () => {
    combos.push(
      makeFakeCombo({
        commanderSpellbookId: "3",
      }),
      makeFakeCombo({
        commanderSpellbookId: "2",
      }),
      makeFakeCombo({
        commanderSpellbookId: "1",
      }),
      makeFakeCombo({
        commanderSpellbookId: "5",
      }),
      makeFakeCombo({
        commanderSpellbookId: "4",
      })
    );

    const sortedCombos = await sortCombos(combos, "id", "ascending");

    expect(sortedCombos[0].commanderSpellbookId).toBe("1");
    expect(sortedCombos[1].commanderSpellbookId).toBe("2");
    expect(sortedCombos[2].commanderSpellbookId).toBe("3");
    expect(sortedCombos[3].commanderSpellbookId).toBe("4");
    expect(sortedCombos[4].commanderSpellbookId).toBe("5");
  });

  it("sorts combos by id in descending order", async () => {
    combos.push(
      makeFakeCombo({
        commanderSpellbookId: "3",
      }),
      makeFakeCombo({
        commanderSpellbookId: "2",
      }),
      makeFakeCombo({
        commanderSpellbookId: "1",
      }),
      makeFakeCombo({
        commanderSpellbookId: "5",
      }),
      makeFakeCombo({
        commanderSpellbookId: "4",
      })
    );

    const sortedCombos = await sortCombos(combos, "id", "descending");

    expect(sortedCombos[0].commanderSpellbookId).toBe("5");
    expect(sortedCombos[1].commanderSpellbookId).toBe("4");
    expect(sortedCombos[2].commanderSpellbookId).toBe("3");
    expect(sortedCombos[3].commanderSpellbookId).toBe("2");
    expect(sortedCombos[4].commanderSpellbookId).toBe("1");
  });

  it.each(["cards", "prerequisites", "steps", "results"])(
    "sorts combos by number of %s",
    async (kind) => {
      combos.push(
        makeFakeCombo({
          commanderSpellbookId: "3",
          [kind]: ["1", "2", "3"],
        }),
        makeFakeCombo({
          commanderSpellbookId: "2",
          [kind]: ["1", "2"],
        }),
        makeFakeCombo({
          commanderSpellbookId: "1",
          [kind]: ["1"],
        }),
        makeFakeCombo({
          commanderSpellbookId: "5",
          [kind]: ["1", "2", "3", "4", "5"],
        }),
        makeFakeCombo({
          commanderSpellbookId: "4",
          [kind]: ["1", "2", "3", "4"],
        })
      );

      const sortedCombos = await sortCombos(combos, kind, "ascending");

      expect(sortedCombos[0].commanderSpellbookId).toBe("1");
      expect(sortedCombos[1].commanderSpellbookId).toBe("2");
      expect(sortedCombos[2].commanderSpellbookId).toBe("3");
      expect(sortedCombos[3].commanderSpellbookId).toBe("4");
      expect(sortedCombos[4].commanderSpellbookId).toBe("5");
    }
  );

  it.each(["cards", "prerequisites", "steps", "results"])(
    "sorts combos by number of %s in descending order",
    async (kind) => {
      combos.push(
        makeFakeCombo({
          commanderSpellbookId: "3",
          [kind]: ["1", "2", "3"],
        }),
        makeFakeCombo({
          commanderSpellbookId: "2",
          [kind]: ["1", "2"],
        }),
        makeFakeCombo({
          commanderSpellbookId: "1",
          [kind]: ["1"],
        }),
        makeFakeCombo({
          commanderSpellbookId: "5",
          [kind]: ["1", "2", "3", "4", "5"],
        }),
        makeFakeCombo({
          commanderSpellbookId: "4",
          [kind]: ["1", "2", "3", "4"],
        })
      );

      const sortedCombos = await sortCombos(combos, kind, "descending");

      expect(sortedCombos[0].commanderSpellbookId).toBe("5");
      expect(sortedCombos[1].commanderSpellbookId).toBe("4");
      expect(sortedCombos[2].commanderSpellbookId).toBe("3");
      expect(sortedCombos[3].commanderSpellbookId).toBe("2");
      expect(sortedCombos[4].commanderSpellbookId).toBe("1");
    }
  );

  it("sorts combos by color identity (using the order displayed on EDHREC)", async () => {
    COLOR_ORDER.forEach((color, index) => {
      combos.push(
        makeFakeCombo({
          commanderSpellbookId: String(index + 1),
          colorIdentity: color.join(""),
        })
      );
    });
    // randomize order
    combos.sort(() => 0.5 - Math.random());

    expect(combos.length).toBe(32);

    const sortedCombos = await sortCombos(combos, "colors", "ascending");

    expect(sortedCombos.length).toBe(32);

    sortedCombos.forEach((combo, index) => {
      expect(combo.commanderSpellbookId).toBe(String(index + 1));
    });
  });

  it("sorts combos by color identity in descending order (using reverse order displayed on EDHREC)", async () => {
    COLOR_ORDER.forEach((color, index) => {
      combos.push(
        makeFakeCombo({
          // basically setting ids 1-32 in reverse order
          commanderSpellbookId: String(32 - index),
          colorIdentity: color.join(""),
        })
      );
    });
    // randomize order
    combos.sort(() => 0.5 - Math.random());

    expect(combos.length).toBe(32);

    const sortedCombos = await sortCombos(combos, "colors", "descending");

    expect(sortedCombos.length).toBe(32);

    sortedCombos.forEach((combo, index) => {
      expect(combo.commanderSpellbookId).toBe(String(index + 1));
    });
  });

  it("sorts combos with identical color identities by number of cards", async () => {
    combos.push(
      makeFakeCombo({
        commanderSpellbookId: "5",
        cards: ["1"],
        colorIdentity: "wubrg",
      }),
      makeFakeCombo({
        commanderSpellbookId: "1",
        cards: ["1", "2", "3", "4"],
        colorIdentity: "c",
      }),
      makeFakeCombo({
        commanderSpellbookId: "3",
        cards: ["1", "2"],
        colorIdentity: "bug",
      }),
      makeFakeCombo({
        commanderSpellbookId: "2",
        cards: ["1"],
        colorIdentity: "bug",
      }),
      makeFakeCombo({
        commanderSpellbookId: "4",
        cards: ["1", "2", "3"],
        colorIdentity: "bug",
      })
    );

    const sortedCombos = await sortCombos(combos, "colors", "ascending");

    expect(sortedCombos[0].commanderSpellbookId).toBe("1");
    expect(sortedCombos[1].commanderSpellbookId).toBe("2");
    expect(sortedCombos[2].commanderSpellbookId).toBe("3");
    expect(sortedCombos[3].commanderSpellbookId).toBe("4");
    expect(sortedCombos[4].commanderSpellbookId).toBe("5");
  });
});
