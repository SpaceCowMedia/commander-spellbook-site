import findById from "@/lib/api/find-by-id";
import search from "@/lib/api/search";
import random from "@/lib/api/random";
import getAllCombos from "@/lib/api/get-all-combos";

const json = require("../../static/api/combo-data.json");

describe("API Module", () => {
  beforeEach(() => {
    // we have to mock the fetch here since jest does not
    // have fetch in its API. Easy enough to just skip the
    // network request and provide the static data anyway
    // @ts-ignore
    window.fetch = () => {
      return Promise.resolve({
        json: () => {
          return Promise.resolve(json);
        },
      });
    };
  });

  describe("findById", () => {
    it("returns a specified combo", async () => {
      const combo = await findById("1");

      expect(combo.commanderSpellbookId).toBeTruthy();
      expect(combo.permalink).toBeTruthy();
      expect(combo.cards).toBeTruthy();
      expect(combo.colorIdentity).toBeTruthy();
      expect(combo.prerequisites).toBeTruthy();
      expect(combo.steps).toBeTruthy();
      expect(combo.results).toBeTruthy();
    });

    it("rejects when combo does not exist", async () => {
      expect.assertions(1);

      try {
        await findById("does-not-exist");
      } catch (err) {
        expect(err.message).toBe(
          'Combo with id "does-not-exist" could not be found.'
        );
      }
    });
  });

  describe("search", () => {
    it("looks up specific id", async () => {
      const { combos } = await search("spellbookid:123");

      expect(combos.length).toBe(1);
      expect(combos[0].commanderSpellbookId).toBe("123");
    });

    it("can exclude ids", async () => {
      const { combos } = await search("-spellbookid:123");

      expect(combos.length).toBeGreaterThan(0);
      combos.forEach((combo) => {
        expect(combo.commanderSpellbookId).not.toBe("123");
      });
    });

    it("looks up specific cards", async () => {
      const { combos } = await search("Sydri");

      expect(combos.length).toBeGreaterThan(0);
      combos.forEach((combo) => {
        const hasSydriInCombo = combo.cards.find(
          (card) => card.name === "Sydri, Galvanic Genius"
        );

        expect(hasSydriInCombo).toBeTruthy();
      });
    });

    it("can filter out specific cards", async () => {
      const { combos } = await search("-card:Sydri -card:aetherflux");

      expect(combos.length).toBeGreaterThan(0);
      combos.forEach((combo) => {
        const hasSydriOrAetherfluxInCombo = combo.cards.find(
          (card) =>
            card.name === "Sydri, Galvanic Genius" ||
            card.name === "Aetherflux Reservoir"
        );

        expect(hasSydriOrAetherfluxInCombo).toBeFalsy();
      });
    });

    it("looks up number of cards", async () => {
      const { combos } = await search("cards>5");

      expect(combos.length).toBeGreaterThan(0);
      combos.forEach((combo) => {
        expect(combo.cards.length > 5).toBe(true);
      });
    });

    it("can specify sort", async () => {
      const { combos } = await search("ci:wubrg sort:cards");

      expect(combos.length).toBeGreaterThan(0);
      let numberOfCards = 2;

      combos.forEach((combo) => {
        if (combo.cards.length > numberOfCards) {
          numberOfCards = combo.cards.length;
          return;
        }
        expect(combo.cards.length).toBe(numberOfCards);
      });

      expect(numberOfCards).toBeGreaterThan(2);
      expect(numberOfCards).toBeLessThan(11);
    });

    describe("color identity", () => {
      it("looks up specific color combos", async () => {
        const { combos } = await search("ci:wr");

        expect(combos.length).toBeGreaterThan(0);
        combos.forEach((combo) => {
          const hasOffColorCombo = combo.colorIdentity.colors.find(
            (color: string) => color !== "w" && color !== "r" && color !== "c"
          );

          expect(hasOffColorCombo).toBeFalsy();
        });
      });

      it("looks up exact color combos", async () => {
        const { combos } = await search("ci=wr");

        expect(combos.length).toBeGreaterThan(0);
        combos.forEach((combo) => {
          expect(combo.colorIdentity.colors).toEqual(["r", "w"]);
        });
      });

      it("looks up colorless combos", async () => {
        const { combos } = await search("ci:c");

        expect(combos.length).toBeGreaterThan(0);
        combos.forEach((combo) => {
          expect(combo.colorIdentity.colors).toEqual(["c"]);
        });
      });

      it("looks up greater than color combos", async () => {
        const { combos } = await search("ci>wr");

        expect(combos.length).toBeGreaterThan(0);
        combos.forEach((combo) => {
          const { colors } = combo.colorIdentity;
          expect(colors.length).toBeGreaterThan(2);
          expect(colors).toContain("w");
          expect(colors).toContain("r");
        });
      });

      it("looks up greater than or equal color combos", async () => {
        const { combos } = await search("ci>=wr");

        let hasExactMatch = false;

        expect(combos.length).toBeGreaterThan(0);
        combos.forEach((combo) => {
          const { colors } = combo.colorIdentity;
          expect(colors.length).toBeGreaterThan(1);
          expect(colors).toContain("w");
          expect(colors).toContain("r");

          if (colors.length === 2) {
            hasExactMatch = true;
          }
        });

        expect(hasExactMatch).toBe(true);
      });

      it("looks up less than color combos", async () => {
        const { combos } = await search("ci<wru");

        expect(combos.length).toBeGreaterThan(0);
        combos.forEach((combo) => {
          const { colors } = combo.colorIdentity;
          expect(colors.length).toBeLessThan(3);
          expect(
            colors.every((item) => {
              const containsItem =
                item === "c" || item === "w" || item === "r" || item === "u";
              const doesNotContain = item !== "b" && item !== "g";

              return containsItem && doesNotContain;
            })
          ).toBe(true);
        });
      });

      it("looks up less than or equal color combos", async () => {
        const { combos } = await search("ci<=wru");

        let hasExactMatch = false;

        expect(combos.length).toBeGreaterThan(0);
        combos.forEach((combo) => {
          const { colors } = combo.colorIdentity;
          expect(colors.length).toBeLessThan(4);
          expect(
            colors.every((item) => {
              const containsItem =
                item === "c" || item === "w" || item === "r" || item === "u";
              const doesNotContain = item !== "b" && item !== "g";

              return containsItem && doesNotContain;
            })
          ).toBe(true);

          if (colors.length === 3) {
            hasExactMatch = true;
          }
        });

        expect(hasExactMatch).toBe(true);
      });

      it("looks up combos without a color identity", async () => {
        const { combos } = await search("-ci=wru");

        expect(combos.length).toBeGreaterThan(0);
        combos.forEach((combo) => {
          const { colors } = combo.colorIdentity;
          const hasColorsFromQuery =
            colors.includes("w") &&
            colors.includes("r") &&
            colors.includes("u") &&
            colors.length === 3;
          expect(hasColorsFromQuery).toBe(false);
        });
      });
    });

    it("looks up specific prequisite in combos", async () => {
      const { combos } = await search("prerequisites:permanents");

      expect(combos.length).toBeGreaterThan(0);
      const hasWordPermanentsInComboPreq = combos.every((combo) => {
        return combo.prerequisites.find((prereq) =>
          prereq.toLowerCase().includes("permanents")
        );
      });

      expect(hasWordPermanentsInComboPreq).toBeTruthy();
    });

    it("looks up combos that exclude specific prerequisites in combos", async () => {
      const { combos } = await search(
        "-prerequisites:permanents -prerequisite:tap -pre:mana"
      );

      expect(combos.length).toBeGreaterThan(0);
      const doesNotHaveWordPermanentsTapOrManaInPrerequisites = combos.every(
        (combo) => {
          return !combo.prerequisites.find(
            (res) =>
              res.toLowerCase().includes("permanents") ||
              res.toLowerCase().includes("tap") ||
              res.toLowerCase().includes("mana")
          );
        }
      );

      expect(doesNotHaveWordPermanentsTapOrManaInPrerequisites).toBeTruthy();
    });

    it("looks up specific step in combos", async () => {
      const { combos } = await search("steps:Tap");

      expect(combos.length).toBeGreaterThan(0);
      const hasWordTapInSteps = combos.every((combo) => {
        return combo.steps.find((step) => step.toLowerCase().includes("tap"));
      });

      expect(hasWordTapInSteps).toBeTruthy();
    });

    it("looks up combos that exclude specific steps in combos", async () => {
      const { combos } = await search("-step:Tap -steps:Sacrifice");

      expect(combos.length).toBeGreaterThan(0);
      const doesNotHaveWordTapOrSacrificeInSteps = combos.every((combo) => {
        return !combo.steps.find(
          (res) =>
            res.toLowerCase().includes("tap") ||
            res.toLowerCase().includes("sacrifice")
        );
      });

      expect(doesNotHaveWordTapOrSacrificeInSteps).toBeTruthy();
    });

    it("looks up specific result in combos", async () => {
      const { combos } = await search("results:Infinite res:mana");

      expect(combos.length).toBeGreaterThan(0);
      const hasWordInfiniteInResult = combos.every((combo) => {
        return combo.results.find(
          (res) =>
            res.toLowerCase().includes("infinite") ||
            res.toLowerCase().includes("mana")
        );
      });

      expect(hasWordInfiniteInResult).toBeTruthy();
    });

    it("looks up combos that exclude specific result in combos", async () => {
      const { combos } = await search("-results:Infinite -result:win");

      expect(combos.length).toBeGreaterThan(0);
      const doesNotHaveWordInfiniteOrWinInResult = combos.every((combo) => {
        return !combo.results.find(
          (res) =>
            res.toLowerCase().includes("infinite") ||
            res.toLowerCase().includes("win")
        );
      });

      expect(doesNotHaveWordInfiniteOrWinInResult).toBeTruthy();
    });

    it("searches for banned combos", async () => {
      const { combos } = await search("is:banned");

      expect(combos.length).toBeGreaterThan(0);
      combos.forEach((combo) => {
        expect(combo.hasBannedCard).toBe(true);
      });
    });

    it("excludes banned combos by default", async () => {
      const allCombos = await getAllCombos();
      const { combos: combosThatAreNotBanned } = await search("");
      const { combos: combosThatIncludeBannedOnes } = await search(
        "include:banned"
      );

      expect(combosThatIncludeBannedOnes.length).toBeGreaterThan(
        combosThatAreNotBanned.length
      );
      expect(combosThatIncludeBannedOnes.length).toBe(allCombos.length);
    });
  });

  describe("random", () => {
    it("returns a random combo", async () => {
      const combo = await random();

      expect(combo.commanderSpellbookId).toBeTruthy();
      expect(combo.permalink).toBeTruthy();
      expect(combo.cards).toBeTruthy();
      expect(combo.colorIdentity).toBeTruthy();
      expect(combo.prerequisites).toBeTruthy();
      expect(combo.steps).toBeTruthy();
      expect(combo.results).toBeTruthy();
    });
  });

  describe("getAllCombos", () => {
    it("returns a all combos", async () => {
      const combos = await getAllCombos();

      expect(combos.length).toBeGreaterThan(0);
      expect(combos[0].commanderSpellbookId).toBeTruthy();
      expect(combos[0].permalink).toBeTruthy();
      expect(combos[0].cards).toBeTruthy();
      expect(combos[0].colorIdentity).toBeTruthy();
      expect(combos[0].prerequisites).toBeTruthy();
      expect(combos[0].steps).toBeTruthy();
      expect(combos[0].results).toBeTruthy();
    });
  });
});
