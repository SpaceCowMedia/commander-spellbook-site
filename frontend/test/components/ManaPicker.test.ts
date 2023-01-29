import { shallowMount } from "@vue/test-utils";
import ManaPicker from "@/components/ManaPicker.vue";

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
});
