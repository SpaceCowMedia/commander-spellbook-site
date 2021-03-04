import { shallowMount, mount } from "@vue/test-utils";
import MultiSearchInput from "@/components/advanced-search/MultiSearchInput.vue";

import type { VueComponent } from "../../types";

describe("MultiSearchInput", () => {
  it("creates an input", () => {
    const wrapper = shallowMount(MultiSearchInput, {
      propsData: {
        inputs: [
          {
            value: "",
            operator: ":",
          },
        ],
        operatorOptions: [{ value: ":", label: "operator label" }],
        label: "Label",
      },
    });

    expect(wrapper.findAll("input.input").length).toBe(1);
    expect(wrapper.findAll(".input-label").length).toBe(1);

    expect(wrapper.find(".input-label").text()).toBe("Label");
  });

  it("creates an operator selector for input", async () => {
    const wrapper = mount(MultiSearchInput, {
      propsData: {
        inputs: [
          {
            value: "",
            operator: ":",
          },
        ],
        operatorOptions: [
          { value: ":", label: ": operator label" },
          { value: "=", label: "= operator label" },
          { value: ">", label: "> operator label" },
        ],
        label: "Label",
      },
    });

    expect(wrapper.find("select").exists()).toBe(true);

    const options = wrapper.findAll("option");

    expect(options.length).toBe(3);
    expect(options.at(0).attributes("value")).toBe(":");
    expect(options.at(0).text()).toBe(": operator label");
    expect(options.at(1).attributes("value")).toBe("=");
    expect(options.at(1).text()).toBe("= operator label");
    expect(options.at(2).attributes("value")).toBe(">");
    expect(options.at(2).text()).toBe("> operator label");

    await options.at(2).setSelected();

    expect(wrapper.props("inputs")[0].operator).toBe(">");
  });

  it("includes error if provided", () => {
    const wrapper = shallowMount(MultiSearchInput, {
      propsData: {
        inputs: [
          {
            value: "",
            operator: ":",
            error: "has error",
          },
          {
            value: "",
            operator: ":",
          },
          {
            value: "",
            operator: ":",
            error: "has another error",
          },
        ],
      },
    });

    const errors = wrapper.findAll(".input-error");

    expect(errors.length).toBe(2);

    expect(wrapper.find(".input-wrapper-0 .input-error").text()).toContain(
      "has error"
    );
    expect(wrapper.find(".input-wrapper-2 .input-error").text()).toContain(
      "has another error"
    );
  });

  it("emits add-input event when plus button is clicked", async () => {
    const spy = jest.fn();
    const wrapper = shallowMount(MultiSearchInput, {
      propsData: {
        inputs: [
          {
            value: "",
            operator: ":",
          },
          {
            value: "",
            operator: ":",
          },
          {
            value: "",
            operator: ":",
          },
        ],
      },
      mocks: {
        $emit: spy,
      },
    });

    await wrapper.findAll(".plus-button").at(0).trigger("click");

    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith("add-input", 0);

    await wrapper.findAll(".plus-button").at(1).trigger("click");

    expect(spy).toBeCalledTimes(2);
    expect(spy).toBeCalledWith("add-input", 1);

    await wrapper.findAll(".plus-button").at(2).trigger("click");

    expect(spy).toBeCalledTimes(3);
    expect(spy).toBeCalledWith("add-input", 2);
  });

  it("emits remove-input event when plus button is clicked", async () => {
    const spy = jest.fn();
    const wrapper = shallowMount(MultiSearchInput, {
      propsData: {
        inputs: [
          {
            value: "",
            operator: ":",
          },
          {
            value: "",
            operator: ":",
          },
          {
            value: "",
            operator: ":",
          },
        ],
      },
      mocks: {
        $emit: spy,
      },
    });

    await wrapper.findAll(".minus-button").at(0).trigger("click");

    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith("remove-input", 0);

    await wrapper.findAll(".minus-button").at(1).trigger("click");

    expect(spy).toBeCalledTimes(2);
    expect(spy).toBeCalledWith("remove-input", 1);

    await wrapper.findAll(".minus-button").at(2).trigger("click");

    expect(spy).toBeCalledTimes(3);
    expect(spy).toBeCalledWith("remove-input", 2);
  });

  it("automatically updates label to be plural", async () => {
    const wrapper = shallowMount(MultiSearchInput, {
      propsData: {
        label: "Label",
        inputs: [
          {
            value: "",
            operator: ":",
          },
        ],
      },
    });

    expect(wrapper.find(".input-label").text()).toBe("Label");
    await wrapper.setProps({
      inputs: [
        { value: "1", operator: ":" },
        { value: "2", operator: ":" },
      ],
    });
    expect(wrapper.find(".input-label").text()).toBe("Labels");
  });

  it("can pass a custom plural label", async () => {
    const wrapper = shallowMount(MultiSearchInput, {
      propsData: {
        label: "Mouse",
        pluralLabel: "Mice",
        inputs: [
          {
            value: "",
            operator: ":",
          },
        ],
      },
    });

    expect(wrapper.find(".input-label").text()).toBe("Mouse");
    await wrapper.setProps({
      inputs: [
        { value: "1", operator: ":" },
        { value: "2", operator: ":" },
      ],
    });
    expect(wrapper.find(".input-label").text()).toBe("Mice");
  });

  it("only displays minus button when there are multiple inputs", async () => {
    const wrapper = shallowMount(MultiSearchInput, {
      propsData: {
        inputs: [
          {
            value: "",
            operator: ":",
          },
        ],
      },
    });

    expect(wrapper.findAll(".minus-button").length).toBe(0);

    await wrapper.setProps({
      inputs: [
        { value: "1", operator: ":" },
        { value: "2", operator: ":" },
      ],
    });

    expect(wrapper.findAll(".minus-button").length).toBe(2);

    await wrapper.setProps({
      inputs: [
        { value: "1", operator: ":" },
        { value: "2", operator: ":" },
        { value: "3", operator: ":" },
      ],
    });

    expect(wrapper.findAll(".minus-button").length).toBe(3);

    await wrapper.setProps({
      inputs: [{ value: "1", operator: ":" }],
    });

    expect(wrapper.findAll(".minus-button").length).toBe(0);
  });

  describe("addInput", () => {
    it("emits add-input event", () => {
      const spy = jest.fn();
      const wrapper = shallowMount(MultiSearchInput, {
        mocks: {
          $emit: spy,
        },
      });
      const vm = wrapper.vm as VueComponent;

      vm.addInput(5);

      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith("add-input", 5);
    });
  });

  describe("removeInput", () => {
    it("emits remove-input event", () => {
      const spy = jest.fn();
      const wrapper = shallowMount(MultiSearchInput, {
        mocks: {
          $emit: spy,
        },
      });
      const vm = wrapper.vm as VueComponent;

      vm.removeInput(5);

      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith("remove-input", 5);
    });
  });

  describe("getPlaceholder", () => {
    it("returns a random number between 1 and 5 when a number operator is used", () => {
      const wrapper = shallowMount(MultiSearchInput);
      const vm = wrapper.vm as VueComponent;

      jest.spyOn(Math, "random").mockReturnValue(0.6);
      expect(vm.getPlaceholder("=-number")).toBe("ex: 3");
    });

    it("returns configured default placeholder when appropriate option configuration cannot be found", () => {
      const wrapper = shallowMount(MultiSearchInput, {
        propsData: {
          defaultPlaceholder: "placeholder",
          operatorOptions: [
            {
              value: ":",
              label: "some label",
              placeholder: "foo",
            },
          ],
        },
      });
      const vm = wrapper.vm as VueComponent;

      expect(vm.getPlaceholder("=")).toBe("placeholder");
    });

    it("returns configured default placeholder when appropriate option configuration has no placeholder", () => {
      const wrapper = shallowMount(MultiSearchInput, {
        propsData: {
          defaultPlaceholder: "placeholder",
          operatorOptions: [
            {
              value: "=",
              label: "some label",
            },
          ],
        },
      });
      const vm = wrapper.vm as VueComponent;

      expect(vm.getPlaceholder("=")).toBe("placeholder");
    });

    it("returns empty string when appropriate option configuration has no placeholder and there is no default placedholder", () => {
      const wrapper = shallowMount(MultiSearchInput, {
        propsData: {
          operatorOptions: [
            {
              value: "=",
              label: "some label",
            },
          ],
        },
      });
      const vm = wrapper.vm as VueComponent;

      expect(vm.getPlaceholder("=")).toBe("");
    });

    it("returns the placeholder from options configuration if it can be found", () => {
      const wrapper = shallowMount(MultiSearchInput, {
        propsData: {
          operatorOptions: [
            {
              value: "=",
              label: "some label",
              placeholder: "custom placeholder",
            },
          ],
        },
      });
      const vm = wrapper.vm as VueComponent;

      expect(vm.getPlaceholder("=")).toBe("custom placeholder");
    });
  });
});
