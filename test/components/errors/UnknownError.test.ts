import { shallowMount } from "@vue/test-utils";
import { mocked } from "ts-jest/utils";
import getRandomItemFromArray from "@/lib/random-from-array";
import UnknownError from "@/components/errors/UnknownError.vue";
import ErrorBase from "@/components/errors/ErrorBase.vue";

jest.mock("@/lib/random-from-array");

describe("UnknownError", () => {
  it("sets a random background class", () => {
    mocked(getRandomItemFromArray).mockReturnValue("mock-class");

    const wrapper = shallowMount(UnknownError);
    expect(wrapper.vm.$data.unknownErrorClass).toBe("mock-class");
  });

  it("creates an Error Base Component", () => {
    const wrapper = shallowMount(UnknownError);
    const baseError = wrapper.findComponent(ErrorBase);

    expect(baseError).toBeTruthy();
    expect(baseError.props("mainMessage")).toBe("Uh Oh");
    expect(baseError.props("subMessage")).toBe(
      "Something went wrong. Try again in a few minutes."
    );
  });
});
