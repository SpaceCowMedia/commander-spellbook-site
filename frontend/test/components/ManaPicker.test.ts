import { shallowMount } from "@vue/test-utils";
import ManaPicker from "@/components/ManaPicker.vue";
import type { VueComponent } from "@/test/types";

describe("ManaPicker", () => {
  it("creates a checkbox input with a Mana Symbol for the label", () => {
    const ManaSymbol = { template: "<div></div>", props: ["symbol"] };
    const wrapper = shallowMount(ManaPicker, {
      propsData: {
        color: "w",
      },
      stubs: {
        ManaSymbol,
      },
    });

    expect((wrapper.find("input").element as HTMLInputElement).value).toBe("w");
    expect(wrapper.findComponent(ManaSymbol).props("symbol")).toBe("w");
  });

  it("applies opacity class to ManaSymbol when unchecked", async () => {
    const ManaSymbol = { template: "<div></div>", props: ["symbol"] };
    const wrapper = shallowMount(ManaPicker, {
      propsData: {
        color: "w",
        value: ["w", "u"],
      },
      stubs: {
        ManaSymbol,
      },
    });

    expect(wrapper.findComponent(ManaSymbol).classes()).not.toContain(
      "opacity-50"
    );

    await wrapper.setProps({
      value: ["u"],
    });

    expect(wrapper.findComponent(ManaSymbol).classes()).toContain("opacity-50");
  });

  describe("toggle", () => {
    it("removes color from value if checked", () => {
      const $emit = jest.fn();
      const wrapper = shallowMount(ManaPicker, {
        propsData: {
          color: "w",
          value: ["w", "u"],
        },
        mocks: {
          $emit,
        },
      });

      const vm = wrapper.vm as VueComponent;

      vm.toggle();

      expect($emit).toBeCalledWith("input", ["u"]);
    });

    it("adds color from value if not checked", () => {
      const $emit = jest.fn();
      const wrapper = shallowMount(ManaPicker, {
        propsData: {
          color: "w",
          value: ["u"],
        },
        mocks: {
          $emit,
        },
      });

      const vm = wrapper.vm as VueComponent;

      vm.toggle();

      expect($emit).toBeCalledWith("input", ["u", "w"]);
    });
  });
});
