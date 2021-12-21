import Vue from "vue";
import setupApi from "~/plugins/api";

describe("api", () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
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

  it("rejects when http status is 400 or greater", async () => {
    expect.assertions(4);

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

    const fakeFetch = {
      status: 400,
      json: jest.fn().mockResolvedValue({
        message: "400 error message from response",
      }),
    };
    global.fetch = jest.fn().mockResolvedValue(fakeFetch);

    try {
      await Vue.prototype.$api("/path", {
        method: "POST",
        body: "{}",
      });
    } catch (e) {
      expect(e.message).toBe("400 error message from response");
    }

    fakeFetch.status = 422;
    fakeFetch.json.mockResolvedValue({
      message: "422 error message from response",
    });

    try {
      await Vue.prototype.$api("/path", {
        method: "POST",
        body: "{}",
      });
    } catch (e) {
      expect(e.message).toBe("422 error message from response");
    }

    fakeFetch.status = 500;
    fakeFetch.json.mockResolvedValue({
      message: "500 error message from response",
    });

    try {
      await Vue.prototype.$api("/path", {
        method: "POST",
        body: "{}",
      });
    } catch (e) {
      expect(e.message).toBe("500 error message from response");
    }

    fakeFetch.status = 399;
    fakeFetch.json.mockResolvedValue({
      value: "not an error",
    });

    const res = await Vue.prototype.$api("/path", {
      method: "POST",
      body: "{}",
    });

    expect(res.value).toBe("not an error");
  });
});
