import { mocked } from "ts-jest/utils";
import transformGoogleSheetsData from "@/lib/api/transform-google-sheets-data";
import normalizeDatabaseValue from "@/lib/api/normalize-database-value";
import {
  CommanderSpellbookCombos,
  CommanderSpellbookAPIResponse,
} from "@/lib/api/types";

jest.mock("@/lib/api/normalize-database-value");

describe("api", () => {
  let values: CommanderSpellbookCombos;
  let body: CommanderSpellbookAPIResponse;

  beforeEach(() => {
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
    body = {
      spreadsheetId: "foo-1",
      valueRanges: [
        {
          range: "foo",
          majorDimension: "ROWS",
          values,
        },
      ],
    };
  });

  it("formats spreadsheet into usable object", () => {
    const combos = transformGoogleSheetsData(body);

    expect(combos[0].d).toBe("1");
    expect(combos[0].c.length).toBe(2);
    expect(combos[0].c[0]).toBe("Guilded Lotus");
    expect(combos[0].c[1]).toBe("Voltaic Servant");
    expect(combos[0].i).toBe("c");
    expect(combos[0].p).toBe("prereq 1. prereq 2. prereq 3");
    expect(combos[0].s).toBe("step 1. step 2. step 3");
    expect(combos[0].r).toBe("result 1. result 2. result 3");

    expect(combos[1].d).toBe("2");
    expect(combos[1].c.length).toBe(3);
    expect(combos[1].c[0]).toBe("Mindmoil");
    expect(combos[1].c[1]).toBe("Psychosis Crawler");
    expect(combos[1].c[2]).toBe("Teferi's Ageless Insight");
    expect(combos[1].i).toBe("r,u");
    expect(combos[1].p).toBe("prereq");
    expect(combos[1].s).toBe("step");
    expect(combos[1].r).toBe("result");

    expect(combos[2].d).toBe("3");
    expect(combos[2].c.length).toBe(4);
    expect(combos[2].c[0]).toBe("Sidar Kondo of Jamurra");
    expect(combos[2].c[1]).toBe("Tana the Bloodsower");
    expect(combos[2].c[2]).toBe("Breath of Furt");
    expect(combos[2].c[3]).toBe("Fervor");
    expect(combos[2].i).toBe("r,g,w");
    expect(combos[2].p).toBe("prereq");
    expect(combos[2].s).toBe("step");
    expect(combos[2].r).toBe("result");
  });

  it("ignores combo results with fewer than the correct number of columns in the spreadsheet", () => {
    values[1] = ["foo"];

    const combos = transformGoogleSheetsData(body);

    expect(combos.length).toBe(2);
    expect(combos[0].d).toBe("1");
    expect(combos[1].d).toBe("3");
  });

  it("ignores combo results without a card 1 value", () => {
    values[1][1] = "";

    const combos = transformGoogleSheetsData(body);

    expect(combos.length).toBe(2);
    expect(combos[0].d).toBe("1");
    expect(combos[1].d).toBe("3");
  });

  it("ignores combo results without a color identity value", () => {
    values[1][11] = "";

    const combos = transformGoogleSheetsData(body);

    expect(combos.length).toBe(2);
    expect(combos[0].d).toBe("1");
    expect(combos[1].d).toBe("3");
  });

  it("normalizes the data from the spreadsheet", () => {
    transformGoogleSheetsData(body);

    // once for each cell in the spreadsheet
    expect(normalizeDatabaseValue).toBeCalledTimes(51);
  });
});
