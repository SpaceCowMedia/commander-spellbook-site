import { shallowMount } from "@vue/test-utils";
import ProfileInput from "@/components/dashboard/ProfileInput.vue";

describe("ProfileInput", () => {
  it("configures title", () => {
    const wrapper = shallowMount(ProfileInput, {
      propsData: {
        label: "A Label",
        value: "some value",
        helperText: "some text describing the input",
      },
    });

    expect(wrapper.find("label").text()).toBe("A Label");
    expect(wrapper.find(".helper-text").text()).toBe(
      "some text describing the input"
    );
    expect((wrapper.find("input").element as HTMLInputElement).value).toBe(
      "some value"
    );
  });

  it("disables input", () => {
    const wrapper = shallowMount(ProfileInput, {
      propsData: {
        label: "A Label",
        value: "some value",
        helperText: "some text describing the input",
        disabled: true,
      },
    });

    expect(
      (wrapper.find("input").element as HTMLInputElement).getAttribute(
        "disabled"
      )
    ).toBe("disabled");
  });
});
