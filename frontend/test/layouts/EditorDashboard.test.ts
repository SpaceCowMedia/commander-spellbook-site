import { shallowMount } from "@vue/test-utils";
import flushPromises from "flush-promises";
import { createStore, createRouter } from "@/test/utils";
import EditorDashboard from "@/layouts/EditorDashboard.vue";

describe("EditorDashboard", () => {
  it("looks up user on mount", () => {
    const $router = createRouter();
    const $store = createStore({
      getters: {
        "auth/user": { provisioned: true },
        "auth/isAuthenticated": true,
      },
    });

    shallowMount(EditorDashboard, {
      mocks: { $store, $router },
      stubs: {
        Nuxt: true,
      },
    });

    expect($store.dispatch).toBeCalledTimes(1);
    expect($store.dispatch).toBeCalledWith("auth/lookupUser");
  });

  it("does not redirects when user authenticated", async () => {
    const $router = createRouter();
    const $store = createStore({
      getters: {
        "auth/user": {},
        "auth/isAuthenticated": true,
      },
    });

    shallowMount(EditorDashboard, {
      mocks: { $store, $router },
      stubs: {
        Nuxt: true,
      },
    });

    await flushPromises();

    expect($router.push).not.toBeCalled();
  });

  it("redirects when user is not authenticated", async () => {
    const $router = createRouter();
    const $store = createStore({
      getters: {
        "auth/user": {},
        "auth/isAuthenticated": false,
      },
    });

    shallowMount(EditorDashboard, {
      mocks: { $store, $router },
      stubs: {
        Nuxt: true,
      },
    });

    await flushPromises();

    expect($router.push).toBeCalledTimes(1);
    expect($router.push).toBeCalledWith("/login/");
  });

  describe("middleware", () => {
    it("noops if in server mode", () => {
      const defaultServerParam = process.server;

      process.server = true;

      const store = createStore();
      const redirect = jest.fn();

      // @ts-ignore
      EditorDashboard.options.middleware({
        store,
        redirect,
      });

      expect(redirect).not.toBeCalled();

      process.server = defaultServerParam;
    });

    it("noops if user is authenticated", () => {
      const store = createStore({
        getters: {
          "auth/isAuthenticated": true,
        },
      });
      const redirect = jest.fn();

      // @ts-ignore
      EditorDashboard.options.middleware({
        store,
        redirect,
      });

      expect(redirect).not.toBeCalled();
    });

    it("redirects if user is not authenticated", () => {
      const store = createStore({
        getters: {
          "auth/isAuthenticated": false,
        },
      });
      const redirect = jest.fn();

      // @ts-ignore
      EditorDashboard.options.middleware({
        store,
        redirect,
      });

      expect(redirect).toBeCalledTimes(1);
      expect(redirect).toBeCalledWith("/login/");
    });
  });
});
