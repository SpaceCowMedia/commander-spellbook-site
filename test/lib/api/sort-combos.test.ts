import makeFakeCombo from "@/lib/api/make-fake-combo";
import sortCombos from "@/lib/api/sort-combos";
import COLOR_ORDER from "@/lib/api/color-combo-order";
import { FormattedApiResponse, SortValue } from "@/lib/api/types";

describe("search", () => {
  let combos: FormattedApiResponse[];

  beforeEach(() => {
    combos = [];
  });

  it("maintains original order when unsupported sort by value is used", () => {
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

    const sortedCombos = sortCombos(combos, {
      // @ts-ignore
      by: "foo",
      order: "ascending",
      vendor: "cardkingdom",
    });

    expect(sortedCombos[0].commanderSpellbookId).toBe("3");
    expect(sortedCombos[1].commanderSpellbookId).toBe("2");
    expect(sortedCombos[2].commanderSpellbookId).toBe("1");
    expect(sortedCombos[3].commanderSpellbookId).toBe("5");
    expect(sortedCombos[4].commanderSpellbookId).toBe("4");
  });

  it("sorts combos by created at in ascending order", () => {
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
        commanderSpellbookId: "105",
      }),
      makeFakeCombo({
        commanderSpellbookId: "4",
      })
    );

    const sortedCombos = sortCombos(combos, {
      by: "created",
      order: "ascending",
      vendor: "cardkingdom",
    });

    expect(sortedCombos[0].commanderSpellbookId).toBe("1");
    expect(sortedCombos[1].commanderSpellbookId).toBe("2");
    expect(sortedCombos[2].commanderSpellbookId).toBe("3");
    expect(sortedCombos[3].commanderSpellbookId).toBe("4");
    expect(sortedCombos[4].commanderSpellbookId).toBe("105");
  });

  it("sorts combos by created at in descending order", () => {
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
        commanderSpellbookId: "105",
      }),
      makeFakeCombo({
        commanderSpellbookId: "4",
      })
    );

    const sortedCombos = sortCombos(combos, {
      by: "created",
      order: "descending",
      vendor: "cardkingdom",
    });

    expect(sortedCombos[0].commanderSpellbookId).toBe("105");
    expect(sortedCombos[1].commanderSpellbookId).toBe("4");
    expect(sortedCombos[2].commanderSpellbookId).toBe("3");
    expect(sortedCombos[3].commanderSpellbookId).toBe("2");
    expect(sortedCombos[4].commanderSpellbookId).toBe("1");
  });

  it("sorts combos by number of decks on EDHREC in descending order", async () => {
    combos.push(
      makeFakeCombo({
        commanderSpellbookId: "1",
        numberOfEDHRECDecks: 1,
      }),
      makeFakeCombo({
        commanderSpellbookId: "2",
        numberOfEDHRECDecks: 2,
      }),
      makeFakeCombo({
        commanderSpellbookId: "3",
        numberOfEDHRECDecks: 3,
      })
    );
    // randomize order
    combos.sort(() => 0.5 - Math.random());

    const sortedCombos = await sortCombos(combos, {
      by: "popularity",
      order: "descending",
      vendor: "cardkingdom",
    });

    expect(sortedCombos.length).toBe(3);

    sortedCombos.forEach((combo, index) => {
      expect(combo.commanderSpellbookId).toBe(String(3 - index));
    });
  });

  it("sorts combos with identical decks by color identities and then by number of cards", async () => {
    combos.push(
      makeFakeCombo({
        commanderSpellbookId: "5",
        cards: ["1"],
        colorIdentity: "wubrg",
        numberOfEDHRECDecks: 1,
      }),
      makeFakeCombo({
        commanderSpellbookId: "1",
        cards: ["1", "2", "3", "4"],
        colorIdentity: "c",
        numberOfEDHRECDecks: 1,
      }),
      makeFakeCombo({
        commanderSpellbookId: "3",
        cards: ["1", "2"],
        colorIdentity: "bug",
        numberOfEDHRECDecks: 1,
      }),
      makeFakeCombo({
        commanderSpellbookId: "2",
        cards: ["1"],
        colorIdentity: "bug",
        numberOfEDHRECDecks: 1,
      }),
      makeFakeCombo({
        commanderSpellbookId: "4",
        cards: ["1", "2", "3"],
        colorIdentity: "bug",
        numberOfEDHRECDecks: 0,
      })
    );

    const sortedCombos = await sortCombos(combos, {
      by: "popularity",
      order: "ascending",
      vendor: "cardkingdom",
    });

    expect(sortedCombos[0].commanderSpellbookId).toBe("4");
    expect(sortedCombos[1].commanderSpellbookId).toBe("1");
    expect(sortedCombos[2].commanderSpellbookId).toBe("2");
    expect(sortedCombos[3].commanderSpellbookId).toBe("3");
    expect(sortedCombos[4].commanderSpellbookId).toBe("5");
  });

  it("sorts combos with identical prices by color identities and then by number of cards", () => {
    combos.push(
      makeFakeCombo({
        commanderSpellbookId: "5",
        cards: ["1"],
        colorIdentity: "wubrg",
        price: 1,
      }),
      makeFakeCombo({
        commanderSpellbookId: "1",
        cards: ["1", "2", "3", "4"],
        colorIdentity: "c",
        price: 1,
      }),
      makeFakeCombo({
        commanderSpellbookId: "3",
        cards: ["1", "2"],
        colorIdentity: "bug",
        price: 1,
      }),
      makeFakeCombo({
        commanderSpellbookId: "2",
        cards: ["1"],
        colorIdentity: "bug",
        price: 1,
      }),
      makeFakeCombo({
        commanderSpellbookId: "4",
        cards: ["1", "2", "3"],
        colorIdentity: "bug",
        price: 0,
      })
    );

    const sortedCombos = sortCombos(combos, {
      by: "price",
      order: "ascending",
      vendor: "cardkingdom",
    });

    expect(sortedCombos[0].commanderSpellbookId).toBe("4");
    expect(sortedCombos[1].commanderSpellbookId).toBe("1");
    expect(sortedCombos[2].commanderSpellbookId).toBe("2");
    expect(sortedCombos[3].commanderSpellbookId).toBe("3");
    expect(sortedCombos[4].commanderSpellbookId).toBe("5");
  });

  it.each(["cards", "prerequisites", "steps", "results"] as SortValue[])(
    "sorts combos by number of %s",
    (kind) => {
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

      const sortedCombos = sortCombos(combos, {
        by: kind,
        order: "ascending",
        vendor: "cardkingdom",
      });

      expect(sortedCombos[0].commanderSpellbookId).toBe("1");
      expect(sortedCombos[1].commanderSpellbookId).toBe("2");
      expect(sortedCombos[2].commanderSpellbookId).toBe("3");
      expect(sortedCombos[3].commanderSpellbookId).toBe("4");
      expect(sortedCombos[4].commanderSpellbookId).toBe("5");
    }
  );

  it.each(["cards", "prerequisites", "steps", "results"] as SortValue[])(
    "sorts combos by number of %s in descending order",
    (kind) => {
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

      const sortedCombos = sortCombos(combos, {
        by: kind,
        order: "descending",
        vendor: "cardkingdom",
      });

      expect(sortedCombos[0].commanderSpellbookId).toBe("5");
      expect(sortedCombos[1].commanderSpellbookId).toBe("4");
      expect(sortedCombos[2].commanderSpellbookId).toBe("3");
      expect(sortedCombos[3].commanderSpellbookId).toBe("2");
      expect(sortedCombos[4].commanderSpellbookId).toBe("1");
    }
  );

  it("sorts combos by color identity (using the order displayed on EDHREC)", () => {
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

    const sortedCombos = sortCombos(combos, {
      by: "colors",
      order: "ascending",
      vendor: "cardkingdom",
    });

    expect(sortedCombos.length).toBe(32);

    sortedCombos.forEach((combo, index) => {
      expect(combo.commanderSpellbookId).toBe(String(index + 1));
    });
  });

  it("sorts combos by color identity in descending order (using reverse order displayed on EDHREC)", () => {
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

    const sortedCombos = sortCombos(combos, {
      by: "colors",
      order: "descending",
      vendor: "cardkingdom",
    });

    expect(sortedCombos.length).toBe(32);

    sortedCombos.forEach((combo, index) => {
      expect(combo.commanderSpellbookId).toBe(String(index + 1));
    });
  });

  it("sorts combos with identical color identities by number of cards", () => {
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

    const sortedCombos = sortCombos(combos, {
      by: "colors",
      order: "ascending",
      vendor: "cardkingdom",
    });

    expect(sortedCombos[0].commanderSpellbookId).toBe("1");
    expect(sortedCombos[1].commanderSpellbookId).toBe("2");
    expect(sortedCombos[2].commanderSpellbookId).toBe("3");
    expect(sortedCombos[3].commanderSpellbookId).toBe("4");
    expect(sortedCombos[4].commanderSpellbookId).toBe("5");
  });

  it("sorts combos by number of decks on EDHREC", async () => {
    combos.push(
      makeFakeCombo({
        commanderSpellbookId: "1",
        numberOfEDHRECDecks: 1,
      }),
      makeFakeCombo({
        commanderSpellbookId: "2",
        numberOfEDHRECDecks: 2,
      }),
      makeFakeCombo({
        commanderSpellbookId: "3",
        numberOfEDHRECDecks: 3,
      })
    );
    // randomize order
    combos.sort(() => 0.5 - Math.random());
    const sortedCombos = await sortCombos(combos, {
      by: "popularity",
      order: "ascending",
      vendor: "cardkingdom",
    });

    expect(sortedCombos.length).toBe(3);

    sortedCombos.forEach((combo, index) => {
      expect(combo.commanderSpellbookId).toBe(String(index + 1));
    });
  });

  it("sorts combos by price in ascending order", () => {
    combos.push(
      makeFakeCombo({
        commanderSpellbookId: "1",
        price: 1,
      }),
      makeFakeCombo({
        commanderSpellbookId: "2",
        price: 2,
      }),
      makeFakeCombo({
        commanderSpellbookId: "3",
        price: 3,
      }),
      makeFakeCombo({
        commanderSpellbookId: "4",
        price: 4,
      }),
      makeFakeCombo({
        commanderSpellbookId: "5",
        price: 5,
      }),
      makeFakeCombo({
        commanderSpellbookId: "6",
        price: 6,
      }),
      makeFakeCombo({
        commanderSpellbookId: "7",
        price: 7,
      })
    );
    // randomize order
    combos.sort(() => 0.5 - Math.random());

    const sortedCombos = sortCombos(combos, {
      by: "price",
      order: "ascending",
      vendor: "cardkingdom",
    });

    expect(sortedCombos.length).toBe(7);

    sortedCombos.forEach((combo, index) => {
      expect(combo.commanderSpellbookId).toBe(String(index + 1));
    });
  });

  it("sorts combos by price in descending order", () => {
    combos.push(
      makeFakeCombo({
        commanderSpellbookId: "1",
        price: 1,
      }),
      makeFakeCombo({
        commanderSpellbookId: "2",
        price: 2,
      }),
      makeFakeCombo({
        commanderSpellbookId: "3",
        price: 3,
      }),
      makeFakeCombo({
        commanderSpellbookId: "4",
        price: 4,
      }),
      makeFakeCombo({
        commanderSpellbookId: "5",
        price: 5,
      }),
      makeFakeCombo({
        commanderSpellbookId: "6",
        price: 6,
      }),
      makeFakeCombo({
        commanderSpellbookId: "7",
        price: 7,
      })
    );
    // randomize order
    combos.sort(() => 0.5 - Math.random());

    const sortedCombos = sortCombos(combos, {
      by: "price",
      order: "descending",
      vendor: "cardkingdom",
    });

    expect(sortedCombos.length).toBe(7);

    sortedCombos.forEach((combo, index) => {
      expect(combo.commanderSpellbookId).toBe(String(7 - index));
    });
  });

  it("sorts price by vendor passed in", () => {
    combos.push(
      makeFakeCombo({
        commanderSpellbookId: "1",
        price: 1,
      }),
      makeFakeCombo({
        commanderSpellbookId: "2",
        price: 2,
      })
    );

    jest.spyOn(combos[0].cards, "getPrice");

    sortCombos(combos, {
      by: "price",
      order: "ascending",
      vendor: "cardkingdom",
    });

    expect(combos[0].cards.getPrice).toBeCalledWith("cardkingdom");
    expect(combos[0].cards.getPrice).not.toBeCalledWith("tcgplayer");

    jest.mocked(combos[0].cards.getPrice).mockClear();

    sortCombos(combos, {
      by: "price",
      order: "ascending",
      vendor: "tcgplayer",
    });

    expect(combos[0].cards.getPrice).not.toBeCalledWith("cardkingdom");
    expect(combos[0].cards.getPrice).toBeCalledWith("tcgplayer");
  });

  it.each(["prerequisites", "steps", "results", "cards"] as SortValue[])(
    "orders %s in ascending order when an auto order is passed",
    (sort) => {
      combos.push(
        makeFakeCombo({
          commanderSpellbookId: "1",
          [sort]: ["1"],
        }),
        makeFakeCombo({
          commanderSpellbookId: "2",
          [sort]: ["1", "2"],
        }),
        makeFakeCombo({
          commanderSpellbookId: "3",
          [sort]: ["1", "2", "3"],
        }),
        makeFakeCombo({
          commanderSpellbookId: "4",
          [sort]: ["1", "2", "3", "4"],
        }),
        makeFakeCombo({
          commanderSpellbookId: "5",
          [sort]: ["1", "2", "3", "4", "5"],
        })
      );

      // randomize order
      combos.sort(() => 0.5 - Math.random());

      sortCombos(combos, {
        by: sort,
        order: "auto",
        vendor: "cardkingdom",
      });

      expect(combos[0].commanderSpellbookId).toBe("1");
      expect(combos[1].commanderSpellbookId).toBe("2");
      expect(combos[2].commanderSpellbookId).toBe("3");
      expect(combos[3].commanderSpellbookId).toBe("4");
      expect(combos[4].commanderSpellbookId).toBe("5");
    }
  );

  it("orders created at in asecnding order when auto order is used", () => {
    combos.push(
      makeFakeCombo({
        commanderSpellbookId: "1",
      }),
      makeFakeCombo({
        commanderSpellbookId: "2",
      }),
      makeFakeCombo({
        commanderSpellbookId: "3",
      }),
      makeFakeCombo({
        commanderSpellbookId: "4",
      }),
      makeFakeCombo({
        commanderSpellbookId: "5",
      })
    );

    // randomize order
    combos.sort(() => 0.5 - Math.random());

    sortCombos(combos, {
      by: "created",
      order: "auto",
      vendor: "cardkingdom",
    });

    expect(combos[0].commanderSpellbookId).toBe("1");
    expect(combos[1].commanderSpellbookId).toBe("2");
    expect(combos[2].commanderSpellbookId).toBe("3");
    expect(combos[3].commanderSpellbookId).toBe("4");
    expect(combos[4].commanderSpellbookId).toBe("5");
  });

  it("orders decks in descending order when auto order is used", () => {
    combos.push(
      makeFakeCombo({
        commanderSpellbookId: "5",
        numberOfEDHRECDecks: 1,
      }),
      makeFakeCombo({
        commanderSpellbookId: "4",
        numberOfEDHRECDecks: 2,
      }),
      makeFakeCombo({
        commanderSpellbookId: "3",
        numberOfEDHRECDecks: 3,
      }),
      makeFakeCombo({
        commanderSpellbookId: "2",
        numberOfEDHRECDecks: 4,
      }),
      makeFakeCombo({
        commanderSpellbookId: "1",
        numberOfEDHRECDecks: 5,
      })
    );

    // randomize order
    combos.sort(() => 0.5 - Math.random());

    sortCombos(combos, {
      by: "popularity",
      order: "auto",
      vendor: "cardkingdom",
    });

    expect(combos[0].commanderSpellbookId).toBe("1");
    expect(combos[1].commanderSpellbookId).toBe("2");
    expect(combos[2].commanderSpellbookId).toBe("3");
    expect(combos[3].commanderSpellbookId).toBe("4");
    expect(combos[4].commanderSpellbookId).toBe("5");
  });

  it("orders price in descending order when auto order is used", () => {
    combos.push(
      makeFakeCombo({
        commanderSpellbookId: "5",
        price: 1,
      }),
      makeFakeCombo({
        commanderSpellbookId: "4",
        price: 2,
      }),
      makeFakeCombo({
        commanderSpellbookId: "3",
        price: 3,
      }),
      makeFakeCombo({
        commanderSpellbookId: "2",
        price: 4,
      }),
      makeFakeCombo({
        commanderSpellbookId: "1",
        price: 5,
      })
    );

    // randomize order
    combos.sort(() => 0.5 - Math.random());

    sortCombos(combos, {
      by: "price",
      order: "auto",
      vendor: "cardkingdom",
    });

    expect(combos[0].commanderSpellbookId).toBe("1");
    expect(combos[1].commanderSpellbookId).toBe("2");
    expect(combos[2].commanderSpellbookId).toBe("3");
    expect(combos[3].commanderSpellbookId).toBe("4");
    expect(combos[4].commanderSpellbookId).toBe("5");
  });
});
