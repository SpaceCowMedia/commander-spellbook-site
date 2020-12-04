import { shallowMount } from "@vue/test-utils";
import ComboList from "@/components/combo/ComboList.vue";
import TextWithMagicSymbol from "@/components/TextWithMagicSymbol.vue";
import PlaceholderText from "@/components/PlaceholderText.vue";

describe("ComboList", () => {
  it("creates a list of combo items", () => {
    const wrapper = shallowMount(ComboList, {
      propsData: {
        title: "My Title",
        iterations: ["Step 1", "Step 2", "Step 3"],
      },
    });

    expect(wrapper.find(".combo-list-title").element.textContent).toBe(
      "My Title"
    );

    const items = wrapper.findAllComponents(TextWithMagicSymbol);

    expect(items.length).toBe(3);
    expect(items.at(0).props("text")).toBe("Step 1");
    expect(items.at(1).props("text")).toBe("Step 2");
    expect(items.at(2).props("text")).toBe("Step 3");
  });

  it("can set list to be numbered", () => {
    const wrapperWithoutNumbers = shallowMount(ComboList, {
      propsData: {
        title: "My Title",
        iterations: ["Step 1", "Step 2", "Step 3"],
      },
    });
    const wrapperWithNumbers = shallowMount(ComboList, {
      propsData: {
        title: "My Title",
        showNumbers: true,
        iterations: ["Step 1", "Step 2", "Step 3"],
      },
    });

    expect(wrapperWithoutNumbers.find("ol").classes()).not.toContain(
      "list-decimal"
    );
    expect(wrapperWithNumbers.find("ol").classes()).toContain("list-decimal");
  });

  it("provides placeholders when iterations are not yet available", async () => {
    const wrapper = shallowMount(ComboList, {
      propsData: {
        title: "My Title",
        iterations: [],
      },
    });

    await wrapper.setData({
      numberOfPlacholderItems: 4,
    });

    expect(wrapper.findAllComponents(PlaceholderText).length).toBe(4);

    await wrapper.setProps({
      iterations: ["1", "2", "3"],
    });

    expect(wrapper.findAllComponents(PlaceholderText).length).toBe(0);
  });
});
