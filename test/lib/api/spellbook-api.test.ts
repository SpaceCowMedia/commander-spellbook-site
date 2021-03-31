import lookup, { resetCache } from "@/lib/api/spellbook-api";
import normalizeDatabaseValue from "@/lib/api/normalize-database-value";
import Card from "@/lib/api/models/card";
import SpellbookList from "@/lib/api/models/list";
import ColorIdentity from "@/lib/api/models/color-identity";
import {
  CommanderSpellbookCombos,
  CommanderSpellbookAPIResponse,
} from "@/lib/api/types";

import { mocked } from "ts-jest/utils";

jest.mock("@/lib/api/normalize-database-value");

describe("api", () => {
  let values: CommanderSpellbookCombos;

  beforeEach(() => {
    process.server = false;
    mocked(normalizeDatabaseValue).mockImplementation((str: string) => {
      return str;
    });

    values = [
      [
        "1",
        "Guilded Lotus",
        "Voltaic Servant",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "c",
        "prereq 1. prereq 2. prereq 3",
        "step 1. step 2. step 3",
        "result 1. result 2. result 3",
        "false",
        "false",
      ],
      [
        "2",
        "Mindmoil",
        "Psychosis Crawler",
        "Teferi's Ageless Insight",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "r,u",
        "prereq",
        "step",
        "result",
        "true",
        "false",
      ],
      [
        "3",
        "Sidar Kondo of Jamurra",
        "Tana the Bloodsower",
        "Breath of Furt",
        "Fervor",
        "",
        "",
        "",
        "",
        "",
        "",
        "r,g,w",
        "prereq",
        "step",
        "result",
        "false",
        "true",
      ],
    ];
    const body = {
      spreadsheetId: "foo-1",
      valueRanges: [
        {
          range: "foo",
          majorDimension: "ROWS",
          values,
        },
      ],
    } as CommanderSpellbookAPIResponse;

    window.fetch = jest.fn().mockImplementation(() => {
      return Promise.resolve({
        json: jest.fn().mockResolvedValue(body),
      });
    });
  });

  afterEach(() => {
    resetCache();
    process.server = true;
  });

  it("looks up data from api endpoint", async () => {
    await lookup();

    expect(window.fetch).toBeCalledTimes(1);
    expect(window.fetch).toBeCalledWith(
      expect.stringContaining("/combo-data.json")
    );
  });

  it("does not use fetch when on the server", async () => {
    process.server = true;

    await lookup();

    expect(window.fetch).not.toBeCalled();
  });


  it("caches result after first lookup", async () => {
    const firstResult = await lookup();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    mocked(window.fetch).mockImplementation(() => {
      return Promise.resolve({
        json: jest.fn().mockResolvedValue({
          spreadsheetId: "foo-2",
          valueRanges: [
            {
              range: "bar",
              majorDimension: "ROWS",
              values: [],
            },
          ],
        }),
      });
    });

    const secondResult = await lookup();

    expect(firstResult).toBe(secondResult);

    expect(window.fetch).toBeCalledTimes(1);
  });

  jest.useFakeTimers();

  it("waits one second before loading the combo", async () => {
    //call lookup once so that we cache a result
    await lookup();

    //on the second lookup call we should already have a cached result, so useCachedResponse should be truthy
    await lookup();

    //Testing to see that setTimeout is a. called, and b. only called when useCachedResponse is true
    expect(setTimeout).toHaveBeenCalledTimes(1); 
    
    //checking to see that the delay was one second.
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000);
  });

  jest.useFakeTimers();

  it("does not make each combo wait one second when server is rendering", async () => {
    process.server = true; 

    await lookup();
    //looking up twice to set useCachedResponse to true
    await lookup();

    //expect(loookupApi).toReturn(cachedPromise) (should we add something like this?)
    expect(setTimeout).not.toHaveBeenCalled();
  });

  it("can do a fresh lookup when resetting the cache manually", async () => {
    const firstResult = await lookup();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    mocked(window.fetch).mockImplementation(() => {
      return Promise.resolve({
        json: jest.fn().mockResolvedValue({
          spreadsheetId: "foo-2",
          valueRanges: [
            {
              range: "bar",
              majorDimension: "ROWS",
              values: [],
            },
          ],
        }),
      });
    });

    resetCache();

    const secondResult = await lookup();

    expect(firstResult).not.toBe(secondResult);

    expect(window.fetch).toBeCalledTimes(2);
  });

  it("formats spreadsheet into usable object", async () => {
    const combos = await lookup();

    expect(combos[0]).toEqual(
      expect.objectContaining({
        commanderSpellbookId: "1",
        permalink: "https://commanderspellbook.com/?id=1",
        hasBannedCard: false,
        hasSpoiledCard: false,
      })
    );
    expect(combos[0].cards.length).toBe(2);
    expect(combos[0].cards[0]).toBeInstanceOf(Card);
    expect(combos[0].cards[1]).toBeInstanceOf(Card);
    expect(combos[0].colorIdentity).toBeInstanceOf(ColorIdentity);
    expect(combos[0].prerequisites).toBeInstanceOf(SpellbookList);
    expect(combos[0].steps).toBeInstanceOf(SpellbookList);
    expect(combos[0].results).toBeInstanceOf(SpellbookList);

    expect(combos[1]).toEqual(
      expect.objectContaining({
        commanderSpellbookId: "2",
        permalink: "https://commanderspellbook.com/?id=2",
        hasBannedCard: true,
        hasSpoiledCard: false,
      })
    );
    expect(combos[1].cards.length).toBe(3);
    expect(combos[1].cards[0]).toBeInstanceOf(Card);
    expect(combos[1].cards[1]).toBeInstanceOf(Card);
    expect(combos[1].cards[2]).toBeInstanceOf(Card);
    expect(combos[1].colorIdentity).toBeInstanceOf(ColorIdentity);
    expect(combos[1].prerequisites).toBeInstanceOf(SpellbookList);
    expect(combos[1].steps).toBeInstanceOf(SpellbookList);
    expect(combos[1].results).toBeInstanceOf(SpellbookList);

    expect(combos[2]).toEqual(
      expect.objectContaining({
        commanderSpellbookId: "3",
        permalink: "https://commanderspellbook.com/?id=3",
        hasBannedCard: false,
        hasSpoiledCard: true,
      })
    );
    expect(combos[2].cards.length).toBe(4);
    expect(combos[2].cards[0]).toBeInstanceOf(Card);
    expect(combos[2].cards[1]).toBeInstanceOf(Card);
    expect(combos[2].cards[2]).toBeInstanceOf(Card);
    expect(combos[2].cards[3]).toBeInstanceOf(Card);
    expect(combos[2].colorIdentity).toBeInstanceOf(ColorIdentity);
    expect(combos[2].prerequisites).toBeInstanceOf(SpellbookList);
    expect(combos[2].steps).toBeInstanceOf(SpellbookList);
    expect(combos[2].results).toBeInstanceOf(SpellbookList);
  });

  it("ignores combo results with fewer than the correct number of columns in the spreadsheet", async () => {
    values[1] = ["foo"];

    const combos = await lookup();

    expect(combos.length).toBe(2);
    expect(combos[0].commanderSpellbookId).toBe("1");
    expect(combos[1].commanderSpellbookId).toBe("3");
  });

  it("ignores combo results without a card 1 value", async () => {
    values[1][1] = "";

    const combos = await lookup();

    expect(combos.length).toBe(2);
    expect(combos[0].commanderSpellbookId).toBe("1");
    expect(combos[1].commanderSpellbookId).toBe("3");
  });

  it("ignores combo results without a color identity value", async () => {
    values[1][11] = "";

    const combos = await lookup();

    expect(combos.length).toBe(2);
    expect(combos[0].commanderSpellbookId).toBe("1");
    expect(combos[1].commanderSpellbookId).toBe("3");
  });

  it("normalizes the data from the spreadsheet", async () => {
    await lookup();

    // once for each cell in the spreadsheet
    expect(normalizeDatabaseValue).toBeCalledTimes(51);
  });
});
