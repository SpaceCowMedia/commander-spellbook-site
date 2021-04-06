import autocomplete, { clearCache } from "@/lib/api/autocomplete";
import lookup from "@/lib/api/spellbook-api";
import makeFakeCombo from "@/lib/api/make-fake-combo";

import type { FormattedApiResponse } from "@/lib/api/types";

import { mocked } from "ts-jest/utils";
jest.mock("@/lib/api/spellbook-api");

describe("autocomplete", () => {
  let combos: FormattedApiResponse[];

  beforeEach(() => {
    combos = [
      makeFakeCombo({
        cards: ["Card 1", "Card 2"],
        results: ["Result a", "Result b", "Result c"],
      }),
      makeFakeCombo({
        cards: ["Card 3", "Card 1"],
        results: ["Result a", "Result d", "Result c"],
      }),
    ];
    mocked(lookup).mockResolvedValue(combos);
  });

  afterEach(() => {
    clearCache();
  });

  it("looks up all cards from api", async () => {
    const cards = await autocomplete("cards", "");

    expect(cards.length).toBe(3);
    expect(cards[0].value).toBe("card 1");
    expect(cards[1].value).toBe("card 2");
    expect(cards[2].value).toBe("card 3");
    expect(cards[0].label).toBe("Card 1");
    expect(cards[1].label).toBe("Card 2");
    expect(cards[2].label).toBe("Card 3");
  });

  it("looks up subset of cards", async () => {
    const cards = await autocomplete("cards", "2");

    expect(cards.length).toBe(1);
    expect(cards[0].value).toBe("card 2");
  });

  it("looks up all results from api", async () => {
    const results = await autocomplete("results", "");

    expect(results.length).toBe(4);
    expect(results[0].value).toBe("result a");
    expect(results[1].value).toBe("result b");
    expect(results[2].value).toBe("result c");
    expect(results[3].value).toBe("result d");
    expect(results[0].label).toBe("Result a");
    expect(results[1].label).toBe("Result b");
    expect(results[2].label).toBe("Result c");
    expect(results[3].label).toBe("Result d");
  });

  it("looks up subset of results", async () => {
    const results = await autocomplete("results", "b");

    expect(results.length).toBe(1);
    expect(results[0].value).toBe("result b");
  });

  it("can set a limit for number of results when getting all results", async () => {
    const results = await autocomplete("results", "", 2);

    expect(results.length).toBe(2);
    expect(results[0].value).toBe("result a");
    expect(results[1].value).toBe("result b");
  });

  it("can set a limit for number of results when gettting a subset of results", async () => {
    const results = await autocomplete("results", "result", 2);

    expect(results.length).toBe(2);
    expect(results[0].value).toBe("result a");
    expect(results[1].value).toBe("result b");
  });

  it("ignores capitalization and punctuation inconsistencies", async () => {
    combos[0].results[2] = "rEsUlt, c";
    combos[1].results[0] = "rEsUlt, a";
    const results = await autocomplete("results", "");

    expect(results.length).toBe(4);
    expect(results[0].value).toBe("result a");
    expect(results[0].label).toBe("Result a");
    expect(results[3].value).toBe("result c");
    expect(results[3].label).toBe("rEsUlt, c");
  });

  it("looks up all colors from api", async () => {
    const colors = await autocomplete("colors", "");

    expect(colors.length).toBe(42);
  });

  it("looks up subset of colors", async () => {
    const colors = await autocomplete("colors", "red");

    expect(colors.length).toBe(2);
    expect(colors[0].value).toBe("mono red");
    expect(colors[0].label).toBe("Mono Red :manar:");
    expect(colors[1].value).toBe("sans red");
    expect(colors[1].label).toBe("Sans Red :manag::manaw::manau::manab:");
  });

  it("can find colors with aliases", async () => {
    const colors = await autocomplete("colors", "wu");

    expect(colors.length).toBe(8);
    expect(colors[0].value).toBe("azorius");
    expect(colors[1].value).toBe("esper");
    expect(colors[2].value).toBe("bant");
    expect(colors[3].value).toBe("jeskai");
    expect(colors[4].value).toBe("yoretiller");
    expect(colors[5].value).toBe("inktreader");
    expect(colors[6].value).toBe("witchmaw");
    expect(colors[7].value).toBe("five color");
  });

  it("includes a label", async () => {
    const colors = await autocomplete("colors", "wubrg");

    expect(colors.length).toBe(1);
    expect(colors[0].value).toBe("five color");
    expect(colors[0].label).toBe(
      "Five Color :manaw::manau::manab::manar::manag:"
    );
  });

  it("can find azorius when misspelled", async () => {
    const colors = await autocomplete("colors", "azorious");

    expect(colors.length).toBe(1);
    expect(colors[0].value).toBe("azorius");
  });

  it("can find 4 color combos with or without hyphen", async () => {
    let colors = await autocomplete("colors", "yoret");
    expect(colors.length).toBe(1);
    expect(colors[0].value).toBe("yoretiller");

    colors = await autocomplete("colors", "yore-t");
    expect(colors.length).toBe(1);
    expect(colors[0].value).toBe("yoretiller");

    colors = await autocomplete("colors", "glinte");
    expect(colors.length).toBe(1);
    expect(colors[0].value).toBe("glinteye");

    colors = await autocomplete("colors", "glint-e");
    expect(colors.length).toBe(1);
    expect(colors[0].value).toBe("glinteye");

    colors = await autocomplete("colors", "duneb");
    expect(colors.length).toBe(1);
    expect(colors[0].value).toBe("dunebrood");

    colors = await autocomplete("colors", "dune-b");
    expect(colors.length).toBe(1);
    expect(colors[0].value).toBe("dunebrood");

    colors = await autocomplete("colors", "inkt");
    expect(colors.length).toBe(1);
    expect(colors[0].value).toBe("inktreader");

    colors = await autocomplete("colors", "ink-t");
    expect(colors.length).toBe(1);
    expect(colors[0].value).toBe("inktreader");

    colors = await autocomplete("colors", "witchm");
    expect(colors.length).toBe(1);
    expect(colors[0].value).toBe("witchmaw");

    colors = await autocomplete("colors", "witch-m");
    expect(colors.length).toBe(1);
    expect(colors[0].value).toBe("witchmaw");
  });
});
