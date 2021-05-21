import { shallowMount } from "@vue/test-utils";
import RadioSearchInput from "@/components/advanced-search/RadioSearchInput.vue";

describe("RadioSearchInput", () => {
  it("creates radio buttons", () => {
    const wrapper = shallowMount(RadioSearchInput, {
      propsData: {
        options: [
          {
            value: "include",
            label: "label 1",
          },
          {
            value: "exclude",
            label: "label 2",
          },
          {
            value: "is",
            label: "label 3",
          },
        ],
      },
    });

    const radios = wrapper.findAll(".radio-wrapper");

    expect(radios.length).toBe(3);
    expect(radios.at(0).find("input").attributes("value")).toBe("include");
    expect(radios.at(0).find("span").text()).toBe("label 1");
    expect(radios.at(1).find("input").attributes("value")).toBe("exclude");
    expect(radios.at(1).find("span").text()).toBe("label 2");
    expect(radios.at(2).find("input").attributes("value")).toBe("is");
    expect(radios.at(2).find("span").text()).toBe("label 3");
  });

  it("sets checked value", () => {
    const wrapper = shallowMount(RadioSearchInput, {
      propsData: {
        checkedValue: "exclude",
        options: [
          {
            value: "include",
            label: "label 1",
          },
          {
            value: "exclude",
            label: "label 2",
          },
          {
            value: "is",
            label: "label 3",
          },
        ],
      },
    });

    const radios = wrapper.findAll(".radio-wrapper");

    expect(radios.length).toBe(3);
    expect(
      (radios.at(0).find("input").element as HTMLInputElement).checked
    ).toBeFalsy();
    expect(
      (radios.at(1).find("input").element as HTMLInputElement).checked
    ).toBeTruthy();
    expect(
      (radios.at(2).find("input").element as HTMLInputElement).checked
    ).toBeFalsy();
  });

  it("emits update-radio event when value changes", () => {
    const spy = jest.fn();
    const wrapper = shallowMount(RadioSearchInput, {
      propsData: {
        checkedValue: "exclude",
        options: [
          {
            value: "include",
            label: "label 1",
          },
          {
            value: "exclude",
            label: "label 2",
          },
          {
            value: "is",
            label: "label 3",
          },
        ],
      },
      mocks: {
        $emit: spy,
      },
    });

    const radios = wrapper.findAll(".radio-wrapper");

    radios.at(2).find("input").setChecked();

    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith("update-radio", "is");
  });
});
