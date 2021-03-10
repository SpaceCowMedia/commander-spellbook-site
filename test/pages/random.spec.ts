import { shallowMount } from "@vue/test-utils";
import flushPromises from "flush-promises";
import RandomPage from "@/pages/random.vue";
import spellbookApi from "commander-spellbook";

import type { Router } from "../types";

describe("RandomPage", () => {
  let $router: Router;

  beforeEach(() => {
    jest.spyOn(spellbookApi, "random").mockResolvedValue(
      spellbookApi.makeFakeCombo({
        commanderSpellbookId: "123",
      })
    );
    $router = {
      push: jest.fn(),
      replace: jest.fn(),
    };
  });

  it("redirects to a random combo", async () => {
    shallowMount(RandomPage, {
      mocks: {
        $router,
      },
      stubs: {
        SplashPage: true,
      },
    });

    await flushPromises();

    expect(spellbookApi.random).toBeCalledTimes(1);
    expect($router.replace).toBeCalledTimes(1);
    expect($router.replace).toBeCalledWith({
      path: `/combo/123`,
    });
  });
});
