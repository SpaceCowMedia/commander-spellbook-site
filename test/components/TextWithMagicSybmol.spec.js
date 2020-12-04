import { mount } from "@vue/test-utils";
import TextWithMagicSymbol from "@/components/TextWithMagicSymbol.vue";

describe("TextWithMagicSymbol", () => {
  test("renders text", () => {
    const wrapper = mount(TextWithMagicSymbol, {
      propsData: {
        text: "Some text",
      },
    });
    expect(wrapper.findAll(".text").length).toBe(1);
    expect(wrapper.find(".text").element.textContent).toBe("Some text");
    expect(wrapper.findAll(".magic-symbol").length).toBe(0);
  });

  test("renders image", () => {
    const wrapper = mount(TextWithMagicSymbol, {
      propsData: {
        text: ":manar:",
      },
    });
    expect(wrapper.findAll(".text").length).toBe(0);
    expect(wrapper.findAll(".magic-symbol").length).toBe(1);
    expect(wrapper.find(".magic-symbol").element.src).toMatch(/R\.svg$/);
  });

  test("renders longer symbols", () => {
    const wrapper = mount(TextWithMagicSymbol, {
      propsData: {
        text: ":manachaos:",
      },
    });
    expect(wrapper.findAll(".text").length).toBe(0);
    expect(wrapper.findAll(".magic-symbol").length).toBe(1);
    expect(wrapper.find(".magic-symbol").element.src).toMatch(/CHAOS\.svg$/);
  });

  test("renders text and images together", () => {
    const wrapper = mount(TextWithMagicSymbol, {
      propsData: {
        text: "some words, :manar: and :manau: some words",
      },
    });
    const textNodes = wrapper.findAll(".text");
    const imgNodes = wrapper.findAll(".magic-symbol");

    expect(textNodes.length).toBe(3);
    expect(imgNodes.length).toBe(2);
    expect(textNodes.at(0).element.textContent).toBe("some words, ");
    expect(textNodes.at(1).element.textContent).toBe(" and ");
    expect(textNodes.at(2).element.textContent).toBe(" some words");
    expect(imgNodes.at(0).element.src).toMatch(/R\.svg$/);
    expect(imgNodes.at(1).element.src).toMatch(/U\.svg$/);
  });
});
