import lookup, { resetCache } from "@/lib/api/spellbook-api";
import formatApiResponse from "@/lib/api/format-api-response";
import transformGoogleSheetsData from "@/lib/api/transform-google-sheets-data";
import { CommanderSpellbookAPIResponse } from "@/lib/api/types";

import { mocked } from "ts-jest/utils";

jest.mock("@/lib/api/normalize-database-value");
jest.mock("@/lib/api/format-api-response");
jest.mock("@/lib/api/transform-google-sheets-data");

describe("api", () => {
  let body: CommanderSpellbookAPIResponse;

  beforeEach(() => {
    process.server = true;
    // got to do it this way so the test about not returning
    // the same result when reseting the cache works
    mocked(formatApiResponse).mockImplementation(() => {
      return [];
    });
    mocked(transformGoogleSheetsData).mockReturnValue([]);
    body = {
      spreadsheetId: "foo-1",
      valueRanges: [
        {
          range: "foo",
          majorDimension: "ROWS",
          values: [],
        },
      ],
    };

    window.fetch = jest.fn().mockImplementation(() => {
      return Promise.resolve({
        json: jest.fn().mockResolvedValue(body),
      });
    });
  });

  afterEach(() => {
    resetCache();
  });

  it("looks up data from api endpoint", async () => {
    await lookup();

    expect(window.fetch).toBeCalledTimes(1);
    expect(window.fetch).toBeCalledWith(
      expect.stringContaining("https://sheets.googleapis.com/v4/spreadsheets")
    );
  });

  it("looks up data from local version of combo datas when fetch to google fails", async () => {
    mocked(window.fetch).mockRejectedValueOnce(new Error("422"));

    await lookup();

    expect(window.fetch).toBeCalledTimes(2);
    expect(window.fetch).toBeCalledWith(
      expect.stringContaining("https://sheets.googleapis.com/v4/spreadsheets")
    );
    expect(window.fetch).toBeCalledWith(
      expect.stringContaining("/api/combo-data.json")
    );
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

  it("waits one second before loading the combo when not on the server", async () => {
    const oldNodeEnv = process.env.NODE_ENV;

    process.server = false;
    process.env.NODE_ENV = "production";

    jest.useFakeTimers();

    let cachedLookupHasCompleted = false;

    jest.useFakeTimers();

    await lookup();
    lookup().then(() => {
      cachedLookupHasCompleted = true;
    });

    expect(cachedLookupHasCompleted).toBe(false);

    await Promise.resolve().then(() => jest.advanceTimersByTime(999));

    expect(cachedLookupHasCompleted).toBe(false);

    // promises work weirdly with fake timers, we have to do this twice,
    // once to complete the timeout time set in the code and once again
    // to prompt the promise to complete and resolve
    await Promise.resolve().then(() => jest.advanceTimersByTime(1));
    await Promise.resolve().then(() => jest.advanceTimersByTime(1));

    expect(cachedLookupHasCompleted).toBe(true);

    process.env.NODE_ENV = oldNodeEnv;
  });

  it("does not make each combo wait one second when server is rendering", async () => {
    process.server = true;
    jest.useFakeTimers();

    let cachedLookupHasCompleted = false;

    await lookup();
    lookup().then(() => {
      cachedLookupHasCompleted = true;
    });

    // got to do this to make sure the Promise actually resolves
    // in the context of using fake timers
    await Promise.resolve().then(() => jest.advanceTimersByTime(1));

    expect(cachedLookupHasCompleted).toBe(true);
  });

  it("does not make each combo wait one second when NODE_ENV is not production", async () => {
    const oldNodeEnv = process.env.NODE_ENV;

    process.env.NODE_ENV = "development";
    jest.useFakeTimers();

    let cachedLookupHasCompleted = false;

    await lookup();
    lookup().then(() => {
      cachedLookupHasCompleted = true;
    });

    // got to do this to make sure the Promise actually resolves
    // in the context of using fake timers
    await Promise.resolve().then(() => jest.advanceTimersByTime(1));

    expect(cachedLookupHasCompleted).toBe(true);
    process.env.NODE_ENV = oldNodeEnv;
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
    const compressedData = [
      {
        d: "1",
        c: ["a", "b"],
        i: "r,w",
        p: "p",
        s: "s",
        r: "r",
        o: 1,
      },
    ];

    mocked(transformGoogleSheetsData).mockReturnValue(compressedData);

    await lookup();

    expect(transformGoogleSheetsData).toBeCalledTimes(1);
    expect(formatApiResponse).toBeCalledTimes(1);
    expect(transformGoogleSheetsData).toBeCalledWith(body);
    expect(formatApiResponse).toBeCalledWith(compressedData);
  });
});
