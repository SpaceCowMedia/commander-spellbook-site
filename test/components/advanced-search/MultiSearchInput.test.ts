import { shallowMount, mount } from "@vue/test-utils";
import type { VueComponent } from "../../types";
import MultiSearchInput from "@/components/advanced-search/MultiSearchInput.vue";

describe("MultiSearchInput", () => {
  it("creates an input", () => {
    const AutocompleteInputStub = {
      template: "<div><input /></div>",
      props: ["label", "inputClass", "inputId", "placeholder"],
    };
    const wrapper = shallowMount(MultiSearchInput, {
      propsData: {
        value: [
          {
            value: "",
            operator: ":",
          },
        ],
        operatorOptions: [{ value: ":", label: "operator label" }],
        label: "Label Name",
        defaultPlaceholder: "Placeholder",
      },
      stubs: {
        AutocompleteInput: AutocompleteInputStub,
      },
    });

    const inputs = wrapper.findAllComponents(AutocompleteInputStub);
    expect(inputs.length).toBe(1);
    expect(inputs.at(0).props("label")).toBe("Label Name");
    expect(inputs.at(0).props("placeholder")).toBe("Placeholder");
    expect(inputs.at(0).props("inputId")).toBe("label-name-input-0");
    expect(inputs.at(0).props("inputClass")).toBe("border-dark");
  });

  it("creates an operator selector for input", async () => {
    const wrapper = mount(MultiSearchInput, {
      propsData: {
        value: [
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

    expect(wrapper.props("value")[0].operator).toBe(">");
  });

  it("includes error if provided", () => {
    const wrapper = shallowMount(MultiSearchInput, {
      propsData: {
        value: [
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

  it("calls addInput when plus button is clicked", async () => {
    const wrapper = shallowMount(MultiSearchInput, {
      propsData: {
        value: [
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
    });
    const vm = wrapper.vm as VueComponent;

    const spy = jest.spyOn(vm, "addInput");

    await wrapper.findAll(".plus-button").at(0).trigger("click");

    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith(0);

    await wrapper.findAll(".plus-button").at(1).trigger("click");

    expect(spy).toBeCalledTimes(2);
    expect(spy).toBeCalledWith(1);

    await wrapper.findAll(".plus-button").at(2).trigger("click");

    expect(spy).toBeCalledTimes(3);
    expect(spy).toBeCalledWith(2);
  });

  it("calls removeInput when minus button is clicked", async () => {
    const wrapper = shallowMount(MultiSearchInput, {
      propsData: {
        value: [
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
    });
    const vm = wrapper.vm as VueComponent;

    const spy = jest.spyOn(vm, "removeInput").mockImplementation();

    await wrapper.findAll(".minus-button").at(0).trigger("click");

    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith(0);

    await wrapper.findAll(".minus-button").at(1).trigger("click");

    expect(spy).toBeCalledTimes(2);
    expect(spy).toBeCalledWith(1);

    await wrapper.findAll(".minus-button").at(2).trigger("click");

    expect(spy).toBeCalledTimes(3);
    expect(spy).toBeCalledWith(2);
  });

  it("automatically updates label to be plural", async () => {
    const wrapper = shallowMount(MultiSearchInput, {
      propsData: {
        label: "Label",
        value: [
          {
            value: "",
            operator: ":",
          },
        ],
      },
    });

    expect(wrapper.find(".input-label").text()).toBe("Label");
    await wrapper.setProps({
      value: [
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
        value: [
          {
            value: "",
            operator: ":",
          },
        ],
      },
    });

    expect(wrapper.find(".input-label").text()).toBe("Mouse");
    await wrapper.setProps({
      value: [
        { value: "1", operator: ":" },
        { value: "2", operator: ":" },
      ],
    });
    expect(wrapper.find(".input-label").text()).toBe("Mice");
  });

  it("only displays minus button when there are multiple inputs", async () => {
    const wrapper = shallowMount(MultiSearchInput, {
      propsData: {
        value: [
          {
            value: "",
            operator: ":",
          },
        ],
      },
    });

    expect(wrapper.findAll(".minus-button").length).toBe(0);

    await wrapper.setProps({
      value: [
        { value: "1", operator: ":" },
        { value: "2", operator: ":" },
      ],
    });

    expect(wrapper.findAll(".minus-button").length).toBe(2);

    await wrapper.setProps({
      value: [
        { value: "1", operator: ":" },
        { value: "2", operator: ":" },
        { value: "3", operator: ":" },
      ],
    });

    expect(wrapper.findAll(".minus-button").length).toBe(3);

    await wrapper.setProps({
      value: [{ value: "1", operator: ":" }],
    });

    expect(wrapper.findAll(".minus-button").length).toBe(0);
  });

  describe("addInput", () => {
    it("adds inputs after the specified index", () => {
      const value = [
        { value: "1", operator: ":" },
        { value: "2", operator: ":" },
        { value: "3", operator: ":" },
      ];
      const wrapper = shallowMount(MultiSearchInput, {
        propsData: {
          value,
        },
      });
      const vm = wrapper.vm as VueComponent;

      vm.addInput(1);

      expect(value.length).toBe(4);
      expect(value[2]).toEqual({ value: "", operator: ":" });
    });

    it("uses the specified default operator prop if provided", () => {
      const value = [
        { value: "1", operator: ":" },
        { value: "2", operator: ":" },
        { value: "3", operator: ":" },
      ];
      const wrapper = shallowMount(MultiSearchInput, {
        propsData: {
          value,
          defaultOperator: ">",
        },
      });
      const vm = wrapper.vm as VueComponent;

      vm.addInput(1);

      expect(value.length).toBe(4);
      expect(value[2]).toEqual({ value: "", operator: ">" });
    });
  });

  describe("removeInput", () => {
    it("removes input", () => {
      const value = [
        { value: "1", operator: ":" },
        { value: "2", operator: ":" },
        { value: "3", operator: ":" },
      ];
      const wrapper = shallowMount(MultiSearchInput, {
        propsData: {
          value,
        },
      });
      const vm = wrapper.vm as VueComponent;

      vm.removeInput(1);

      expect(value.length).toBe(2);
      expect(value[0]).toEqual({ value: "1", operator: ":" });
      expect(value[1]).toEqual({ value: "3", operator: ":" });
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
