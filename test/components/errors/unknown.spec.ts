import { shallowMount } from "@vue/test-utils";
import getRandomItemFromArray from "@/lib/random-from-array";
import UnknownErrorComponent from "@/components/errors/unknown.vue";
import ErrorBaseComponent from "@/components/errors/error-base.vue";

import { mocked } from "ts-jest/utils";
jest.mock("@/lib/random-from-array");

describe("UnknownErrorComponent", () => {
  it("sets a random background class", () => {
    mocked(getRandomItemFromArray).mockReturnValue("mock-class");

    const wrapper = shallowMount(UnknownErrorComponent);
    expect(wrapper.vm.$data.unknownErrorClass).toBe("mock-class");
  });

  it("creates an Error Base Component", () => {
    const wrapper = shallowMount(UnknownErrorComponent);
    const baseError = wrapper.findComponent(ErrorBaseComponent);

    expect(baseError).toBeTruthy();
    expect(baseError.props("mainMessage")).toBe("Uh Oh");
    expect(baseError.props("subMessage")).toBe(
      "Something went wrong. Try again in a few minutes."
    );
  });
});
