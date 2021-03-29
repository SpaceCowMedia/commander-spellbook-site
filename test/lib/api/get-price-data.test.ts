import getPriceData, { resetCache } from "@/lib/api/get-price-data";

import type { EDHRecData } from "@/lib/api/types";

import { mocked } from "ts-jest/utils";

describe("api", () => {
  let body: EDHRecData;

  beforeEach(() => {
    process.server = false;
    body = {
      "card 1": {
        tcgplayer: {
          price: 0.12,
        },
        cardkingdom: {
          price: 1.25,
        },
      },
      "card 2": {
        tcgplayer: {
          price: 4.13,
        },
        cardkingdom: {
          price: 9.99,
        },
      },
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

  it("looks up data from local api endpoint on browser", async () => {
    await getPriceData();

    expect(window.fetch).toBeCalledTimes(1);
    expect(window.fetch).toBeCalledWith(
      expect.stringContaining("/api/price-data.json")
    );
  });

  it("looks up data from remote version on EDHRec when on the server", async () => {
    process.server = true;

    await getPriceData();

    expect(window.fetch).toBeCalledTimes(1);
    expect(window.fetch).toBeCalledWith(
      expect.stringContaining("https://edhrec.com/api/prices/")
    );
  });

  it("caches result after first lookup", async () => {
    const firstResult = await getPriceData();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    mocked(window.fetch).mockImplementation(() => {
      return Promise.resolve({
        json: jest.fn().mockResolvedValue({}),
      });
    });

    const secondResult = await getPriceData();

    expect(firstResult).toBe(secondResult);

    expect(window.fetch).toBeCalledTimes(1);
  });

  it("can do a fresh lookup when resetting the cache manually", async () => {
    const firstResult = await getPriceData();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    mocked(window.fetch).mockImplementation(() => {
      return Promise.resolve({
        json: jest.fn().mockResolvedValue({}),
      });
    });

    resetCache();

    const secondResult = await getPriceData();

    expect(firstResult).not.toBe(secondResult);

    expect(window.fetch).toBeCalledTimes(2);
  });
});
