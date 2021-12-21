import Vue from "vue";
import setupApi from "~/plugins/api";

describe("api", () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({}),
    });
  });

  afterEach(() => {
    delete Vue.prototype.$api;
  });

  it("adds $api to the Vue prototype", () => {
    expect(Vue.prototype.$api).toBeFalsy();

    setupApi(
      // @ts-ignore
      {
        env: {
          apiBaseUrl: "https://example.com/v1",
        },
        $fire: {
          // @ts-ignore
          auth: {},
        },
      },
      null
    );

    expect(Vue.prototype.$api).toBeTruthy();
  });

  it("rejects when there is no active user", async () => {
    expect.assertions(1);

    setupApi(
      // @ts-ignore
      {
        env: {
          apiBaseUrl: "https://example.com/v1",
        },
        $fire: {
          // @ts-ignore
          auth: {},
        },
      },
      null
    );

    try {
      await Vue.prototype.$api("/path");
    } catch (e) {
      expect(e.message).toBe(
        "User not logged in. Refreshng your browser and try again."
      );
    }
  });

  it("sends an api request with users auth token", async () => {
    setupApi(
      // @ts-ignore
      {
        env: {
          apiBaseUrl: "https://example.com/v1",
        },
        $fire: {
          // @ts-ignore
          auth: {
            // @ts-ignore
            currentUser: {
              getIdToken: jest.fn().mockResolvedValue("token"),
            },
          },
        },
      },
      null
    );

    await Vue.prototype.$api("/path");

    expect(global.fetch).toBeCalledTimes(1);
    expect(global.fetch).toBeCalledWith("https://example.com/v1/path", {
      headers: {
        Authorization: "Bearer token",
        "Content-Type": "application/json",
      },
    });
  });

  it("can pass additional options to fetch", async () => {
    setupApi(
      // @ts-ignore
      {
        env: {
          apiBaseUrl: "https://example.com/v1",
        },
        $fire: {
          // @ts-ignore
          auth: {
            // @ts-ignore
            currentUser: {
              getIdToken: jest.fn().mockResolvedValue("token"),
            },
          },
        },
      },
      null
    );

    await Vue.prototype.$api("/path", {
      method: "POST",
      body: "{}",
    });

    expect(global.fetch).toBeCalledTimes(1);
    expect(global.fetch).toBeCalledWith("https://example.com/v1/path", {
      method: "POST",
      body: "{}",
      headers: {
        Authorization: "Bearer token",
        "Content-Type": "application/json",
      },
    });
  });
});
