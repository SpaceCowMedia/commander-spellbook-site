import { shallowMount } from "@vue/test-utils";
import getRandomItemFromArray from "@/lib/random-from-array";
import NotFoundError from "@/components/errors/NotFoundError.vue";
import ErrorBase from "@/components/errors/ErrorBase.vue";

jest.mock("@/lib/random-from-array");

describe("NotFoundError", () => {
  beforeEach(() => {
    jest
      .mocked(getRandomItemFromArray)
      .mockReturnValue(["mock-class", "mock message"]);
  });

  it("sets a random background class", () => {
    const wrapper = shallowMount(NotFoundError);
    expect(wrapper.vm.$data.notFoundClass).toBe("mock-class");
    expect(wrapper.vm.$data.notFoundMessage).toBe("mock message");
  });

  it("creates an Error Base Component", () => {
    const wrapper = shallowMount(NotFoundError);
    const baseError = wrapper.findComponent(ErrorBase);

    expect(baseError).toBeTruthy();
    expect(baseError.props("mainMessage")).toBe("Page Not Found");
  });
});
