import lookup, { resetCache } from "@/lib/api/spellbook-api";
import normalizeDatabaseValue from "@/lib/api/normalize-database-value";
import formatApiResponse from "@/lib/api/format-api-response";
import { CommanderSpellbookAPIResponse } from "@/lib/api/types";

import { mocked } from "ts-jest/utils";

jest.mock("@/lib/api/normalize-database-value");
jest.mock("@/lib/api/format-api-response");

describe("api", () => {
  let body: CommanderSpellbookAPIResponse;

  beforeEach(() => {
    process.server = false;
    mocked(normalizeDatabaseValue).mockImplementation((str: string) => {
      return str;
    });
    mocked(formatApiResponse).mockImplementation(() => {
      return [];
    });
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
    process.server = true;
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
    await lookup();

    expect(formatApiResponse).toBeCalledTimes(1);
    expect(formatApiResponse).toBeCalledWith(body);
  });
});
