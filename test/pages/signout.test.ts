import { shallowMount } from "@vue/test-utils";
import flushPromises from "flush-promises";
import SignoutPage from "@/pages/signout.vue";
import { createStore } from "../utils";

import type { Store, Router } from "../types";

describe("SignoutPage", () => {
  let $router: Router, $store: Store;

  beforeEach(() => {
    $router = {
      push: jest.fn(),
      replace: jest.fn(),
    };
    $store = createStore();
  });

  it("dispatches signOut action", async () => {
    shallowMount(SignoutPage, {
      mocks: {
        $store,
        $router,
      },
      stubs: {
        SplashPage: true,
      },
    });

    await flushPromises();

    expect($store.dispatch).toBeCalledTimes(1);
    expect($store.dispatch).toBeCalledWith("auth/signOut");
  });

  it("redirects to home page", async () => {
    shallowMount(SignoutPage, {
      mocks: {
        $store,
        $router,
      },
      stubs: {
        SplashPage: true,
      },
    });

    await flushPromises();

    expect($router.replace).toBeCalledTimes(1);
    expect($router.replace).toBeCalledWith({
      path: "/",
    });
  });
});
