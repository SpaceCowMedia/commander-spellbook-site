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
    const spy = jest.fn();

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
      spy
    );

    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith("api", expect.any(Function));
  });

  it("rejects when there is no active user", async () => {
    expect.assertions(1);

    const spy = jest.fn();

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
      spy
    );

    const $api = spy.mock.calls[0][1];

    try {
      await $api("/path");
    } catch (e) {
      expect(e.message).toBe(
        "User not logged in. Refreshng your browser and try again."
      );
    }
  });

  it("sends an api request with users auth token", async () => {
    const spy = jest.fn();

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
      spy
    );

    const $api = spy.mock.calls[0][1];

    await $api("/path");

    expect(global.fetch).toBeCalledTimes(1);
    expect(global.fetch).toBeCalledWith("https://example.com/v1/path", {
      headers: {
        Authorization: "Bearer token",
        "Content-Type": "application/json",
      },
    });
  });

  it("sends post request when a post body is provided", async () => {
    const spy = jest.fn();

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
      spy
    );

    const $api = spy.mock.calls[0][1];

    await $api("/path", {
      foo: {
        bar: "baz",
      },
    });

    expect(global.fetch).toBeCalledTimes(1);
    expect(global.fetch).toBeCalledWith("https://example.com/v1/path", {
      method: "post",
      body: '{"foo":{"bar":"baz"}}',
      headers: {
        Authorization: "Bearer token",
        "Content-Type": "application/json",
      },
    });
  });

  it("rejects when http status is 400 or greater", async () => {
    expect.assertions(4);

    const spy = jest.fn();

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
      spy
    );

    const $api = spy.mock.calls[0][1];

    const fakeFetch = {
      status: 400,
      json: jest.fn().mockResolvedValue({
        message: "400 error message from response",
      }),
    };
    global.fetch = jest.fn().mockResolvedValue(fakeFetch);

    try {
      await $api("/path", {
        foo: "bar",
      });
    } catch (e) {
      expect(e.message).toBe("400 error message from response");
    }

    fakeFetch.status = 422;
    fakeFetch.json.mockResolvedValue({
      message: "422 error message from response",
    });

    try {
      await $api("/path", {
        foo: "bar",
      });
    } catch (e) {
      expect(e.message).toBe("422 error message from response");
    }

    fakeFetch.status = 500;
    fakeFetch.json.mockResolvedValue({
      message: "500 error message from response",
    });

    try {
      await $api("/path", {
        foo: "bar",
      });
    } catch (e) {
      expect(e.message).toBe("500 error message from response");
    }

    fakeFetch.status = 399;
    fakeFetch.json.mockResolvedValue({
      value: "not an error",
    });

    const res = await $api("/path", {
      foo: "bar",
    });

    expect(res.value).toBe("not an error");
  });
});
