import { shallowMount } from "@vue/test-utils";
import flushPromises from "flush-promises";
import RandomPage from "@/pages/random.vue";
import makeFakeCombo from "@/lib/api/make-fake-combo";
import random from "@/lib/api/random";
import { mocked } from "ts-jest/utils";

import type { Router } from "../types";

jest.mock("@/lib/api/random");

describe("RandomPage", () => {
  let $router: Router;

  beforeEach(() => {
    mocked(random).mockResolvedValue(
      makeFakeCombo({
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

    expect(random).toBeCalledTimes(1);
    expect($router.replace).toBeCalledTimes(1);
    expect($router.replace).toBeCalledWith({
      path: `/combo/123/`,
    });
  });
});
