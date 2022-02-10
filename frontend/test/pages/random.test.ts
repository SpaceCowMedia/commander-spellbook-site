import { shallowMount } from "@vue/test-utils";
import flushPromises from "flush-promises";
import type { Route, Router } from "@/test/types";
import RandomPage from "@/pages/random.vue";
import makeFakeCombo from "@/lib/api/make-fake-combo";
import random from "@/lib/api/random";

jest.mock("@/lib/api/random");

describe("RandomPage", () => {
  let $route: Route, $router: Router;

  beforeEach(() => {
    jest.mocked(random).mockResolvedValue(
      makeFakeCombo({
        commanderSpellbookId: "123",
      })
    );
    $route = {
      query: {},
    };
    $router = {
      push: jest.fn(),
      replace: jest.fn(),
    };
  });

  it("redirects to a random combo", async () => {
    shallowMount(RandomPage, {
      mocks: {
        $route,
        $router,
      },
      stubs: {
        SplashPage: true,
      },
    });

    await flushPromises();

    expect(random).toBeCalledTimes(1);
    expect($router.replace).toBeCalledTimes(1);
    expect($router.replace).toBeCalledWith({
      path: `/combo/123/`,
    });
  });

  it("redirects to a not found page when random throws an error combo", async () => {
    jest.mocked(random).mockRejectedValue("no combo");
    shallowMount(RandomPage, {
      mocks: {
        $route,
        $router,
      },
      stubs: {
        SplashPage: true,
      },
    });

    await flushPromises();

    expect(random).toBeCalledTimes(1);
    expect($router.replace).toBeCalledTimes(1);
    expect($router.replace).toBeCalledWith({
      path: "/combo-not-found/",
    });
  });

  it("redirects to a random combo with query", async () => {
    $route.query.q = "search";
    shallowMount(RandomPage, {
      mocks: {
        $route,
        $router,
      },
      stubs: {
        SplashPage: true,
      },
    });

    await flushPromises();

    expect(random).toBeCalledTimes(1);
    expect(random).toBeCalledWith("search");
    expect($router.replace).toBeCalledTimes(1);
    expect($router.replace).toBeCalledWith({
      path: `/combo/123/`,
      query: {
        q: "search",
      },
    });
  });
});
