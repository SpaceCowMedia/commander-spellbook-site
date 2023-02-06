import { shallowMount } from "@vue/test-utils";
import ColorIdentityPicker from "@/components/ColorIdentityPicker.vue";

describe("ManaPicker", () => {
  it("creates a mana picker for each color in WUBRG", () => {
    const ManaPicker = { template: "<div></div>", props: ["color"] };
    const wrapper = shallowMount(ColorIdentityPicker, {
      stubs: {
        ManaPicker,
      },
    });
    const pickers = wrapper.findAllComponents(ManaPicker);

    expect(pickers.at(0).props("color")).toBe("w");
    expect(pickers.at(1).props("color")).toBe("u");
    expect(pickers.at(2).props("color")).toBe("b");
    expect(pickers.at(3).props("color")).toBe("r");
    expect(pickers.at(4).props("color")).toBe("g");
  });
});
