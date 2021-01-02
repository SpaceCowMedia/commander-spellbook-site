import { shallowMount } from "@vue/test-utils";
import MultiSearchInput from "@/components/advanced-search/MultiSearchInput.vue";

import type { VueComponent } from "../../types";

describe("MultiSearchInput", () => {
  it("creates an input", () => {
    const wrapper = shallowMount(MultiSearchInput, {
      propsData: {
        label: "Label",
        placeholder: "Placeholder",
      },
    });

    expect(wrapper.findAll("input.input").length).toBe(1);
    expect(wrapper.findAll(".input-label").length).toBe(1);

    expect(
      (wrapper.find("input.input").element as HTMLInputElement).placeholder
    ).toBe("Placeholder");
    expect(wrapper.find(".input-label").text()).toBe("Label");
  });

  it("emits data on updates", async () => {
    const spy = jest.fn();
    const wrapper = shallowMount(MultiSearchInput, {
      mocks: {
        $emit: spy,
      },
    });

    await wrapper.setData({
      inputs: [
        {
          value: "a",
        },
        {
          value: "b",
        },
        {
          value: "c",
        },
      ],
    });

    await wrapper.findAll("input.input").at(0).trigger("keyup");

    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith("update", {
      index: 0,
      value: "a",
    });

    await wrapper.findAll("input.input").at(1).trigger("keyup");

    expect(spy).toBeCalledTimes(2);
    expect(spy).toBeCalledWith("update", {
      index: 1,
      value: "b",
    });

    await wrapper.findAll("input.input").at(2).trigger("keyup");

    expect(spy).toBeCalledTimes(3);
    expect(spy).toBeCalledWith("update", {
      index: 2,
      value: "c",
    });
  });

  it("creates additional inputs by pressing the plus button", async () => {
    const wrapper = shallowMount(MultiSearchInput);

    expect(wrapper.findAll("input.input").length).toBe(1);

    await wrapper.findAll(".plus-button").at(0).trigger("click");

    expect(wrapper.findAll("input.input").length).toBe(2);

    await wrapper.findAll(".plus-button").at(0).trigger("click");

    expect(wrapper.findAll("input.input").length).toBe(3);
    expect(wrapper.findAll(".plus-button").length).toBe(3);
  });

  it("adds inputs after the button that was pressed", async () => {
    const wrapper = shallowMount(MultiSearchInput);

    await wrapper.setData({
      inputs: [
        {
          value: "1",
        },
        {
          value: "2",
        },
        {
          value: "3",
        },
      ],
    });

    expect(wrapper.findAll("input.input").length).toBe(3);
    await wrapper.findAll(".plus-button").at(1).trigger("click");

    expect((wrapper.vm as VueComponent).inputs).toEqual([
      {
        value: "1",
      },
      {
        value: "2",
      },
      {
        value: "",
      },
      {
        value: "3",
      },
    ]);

    await wrapper.findAll(".plus-button").at(0).trigger("click");

    expect((wrapper.vm as VueComponent).inputs).toEqual([
      {
        value: "1",
      },
      {
        value: "",
      },
      {
        value: "2",
      },
      {
        value: "",
      },
      {
        value: "3",
      },
    ]);

    expect(wrapper.findAll("input.input").length).toBe(5);
  });

  it("removes additional inputs by pressing the minus button", async () => {
    const wrapper = shallowMount(MultiSearchInput);

    expect(wrapper.findAll("input.input").length).toBe(1);

    await wrapper.findAll(".plus-button").at(0).trigger("click");
    await wrapper.findAll(".plus-button").at(0).trigger("click");

    expect(wrapper.findAll("input.input").length).toBe(3);

    await wrapper.findAll(".minus-button").at(0).trigger("click");

    expect(wrapper.findAll("input.input").length).toBe(2);

    await wrapper.findAll(".minus-button").at(0).trigger("click");

    expect(wrapper.findAll("input.input").length).toBe(1);
  });

  it("removes inputs at the button that was pressed", async () => {
    const wrapper = shallowMount(MultiSearchInput);

    await wrapper.setData({
      inputs: [
        {
          value: "1",
        },
        {
          value: "2",
        },
        {
          value: "3",
        },
      ],
    });

    expect(wrapper.findAll("input.input").length).toBe(3);
    await wrapper.findAll(".minus-button").at(1).trigger("click");

    expect((wrapper.vm as VueComponent).inputs).toEqual([
      {
        value: "1",
      },
      {
        value: "3",
      },
    ]);

    await wrapper.findAll(".minus-button").at(0).trigger("click");

    expect((wrapper.vm as VueComponent).inputs).toEqual([
      {
        value: "3",
      },
    ]);

    expect(wrapper.findAll("input.input").length).toBe(1);
  });

  it("only ever has one label", async () => {
    const wrapper = shallowMount(MultiSearchInput);

    await wrapper.findAll(".plus-button").at(0).trigger("click");
    await wrapper.findAll(".plus-button").at(0).trigger("click");
    await wrapper.findAll(".plus-button").at(0).trigger("click");
    await wrapper.findAll(".plus-button").at(0).trigger("click");

    expect(wrapper.findAll("input.input").length).toBe(5);
    expect(wrapper.findAll(".input-label").length).toBe(1);
  });

  it("automatically updates label to be plural", async () => {
    const wrapper = shallowMount(MultiSearchInput, {
      propsData: {
        label: "Label",
      },
    });

    expect(wrapper.find(".input-label").text()).toBe("Label");
    await wrapper.findAll(".plus-button").at(0).trigger("click");
    expect(wrapper.find(".input-label").text()).toBe("Labels");
  });

  it("can pass a custom plural label", async () => {
    const wrapper = shallowMount(MultiSearchInput, {
      propsData: {
        label: "Mouse",
        pluralLabel: "Mice",
      },
    });

    expect(wrapper.find(".input-label").text()).toBe("Mouse");
    await wrapper.findAll(".plus-button").at(0).trigger("click");
    expect(wrapper.find(".input-label").text()).toBe("Mice");
  });

  it("only displays minus button when there are multiple inputs", async () => {
    const wrapper = shallowMount(MultiSearchInput);

    expect(wrapper.findAll(".minus-button").length).toBe(0);

    await wrapper.findAll(".plus-button").at(0).trigger("click");
    expect(wrapper.findAll(".minus-button").length).toBe(2);
    await wrapper.findAll(".plus-button").at(0).trigger("click");
    expect(wrapper.findAll(".minus-button").length).toBe(3);
    await wrapper.findAll(".plus-button").at(0).trigger("click");
    expect(wrapper.findAll(".minus-button").length).toBe(4);

    await wrapper.findAll(".minus-button").at(0).trigger("click");
    expect(wrapper.findAll(".minus-button").length).toBe(3);
    await wrapper.findAll(".minus-button").at(0).trigger("click");
    expect(wrapper.findAll(".minus-button").length).toBe(2);

    await wrapper.findAll(".minus-button").at(0).trigger("click");
    expect(wrapper.findAll(".minus-button").length).toBe(0);
  });
});
