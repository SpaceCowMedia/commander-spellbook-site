import { mount } from "@vue/test-utils";
import type { VueComponent } from "@/test/types";
import CardHeader from "@/components/combo/CardHeader.vue";

describe("CardHeader", () => {
  it("sets title", () => {
    const wrapper = mount(CardHeader, {
      propsData: {
        title: "combo 1",
        cardsArt: [],
      },
    });

    expect(wrapper.find(".combo-title").element.textContent).toContain(
      "combo 1"
    );
  });

  it("sets subtitle", () => {
    const wrapper = mount(CardHeader, {
      propsData: {
        subtitle: "subtitle",
        cardsArt: [],
      },
    });

    expect(wrapper.find(".combo-subtitle").element.textContent).toContain(
      "subtitle"
    );
  });

  it("sets card images", () => {
    const wrapper = mount(CardHeader, {
      propsData: {
        title: "combo 1",
        cardsArt: [
          "https://example.com/art1.png",
          "https://example.com/art2.png",
          "https://example.com/art3.png",
        ],
      },
    });

    const imgs = wrapper.findAll(".card-wrapper");

    expect((imgs.at(0).element as HTMLElement).style.backgroundImage).toBe(
      "url(https://example.com/art1.png)"
    );
    expect((imgs.at(1).element as HTMLElement).style.backgroundImage).toBe(
      "url(https://example.com/art2.png)"
    );
    expect((imgs.at(2).element as HTMLElement).style.backgroundImage).toBe(
      "url(https://example.com/art3.png)"
    );
  });

  describe("background", () => {
    it("renders url as background-image property", () => {
      const wrapper = mount(CardHeader);

      expect(
        (wrapper.vm as VueComponent).background("https://example.com/art.png")
      ).toBe('background-image: url("https://example.com/art.png")');
    });
  });
});
