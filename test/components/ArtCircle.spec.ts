import { mount } from "@vue/test-utils";
import ArtCircle from "@/components/ArtCircle.vue";
import type { VueComponent } from "../types";

describe("ArtCircle", () => {
  it("applies background image based on the card", () => {
    const wrapper = mount(ArtCircle, {
      propsData: {
        cardName: "Card Name",
      },
    });

    // Not really sure what to do here to test the actual stuff
    // since the image requires get mocked in the jest moduleNameWrapper
    expect((wrapper.vm as VueComponent).computedStyle.backgroundImage).toBe(
      "url('file-name')"
    );
  });

  it("includes artist as title", () => {
    const wrapper = mount(ArtCircle, {
      propsData: {
        cardName: "Card Name",
        artist: "Some Name",
      },
    });

    expect(wrapper.element.getAttribute("title")).toBe(
      "Card Name by Some Name"
    );
  });

  it("can provide a custom title", () => {
    const wrapper = mount(ArtCircle, {
      propsData: {
        title: "Custom Title",
        cardName: "Card Name",
        artist: "Some Name",
      },
    });

    expect(wrapper.element.getAttribute("title")).toBe("Custom Title");
  });

  it("defaults height and width class to 64", () => {
    const wrapper = mount(ArtCircle, {
      propsData: {
        cardName: "Card Name",
      },
    });

    expect(wrapper.element.style.width).toEqual("16rem");
    expect(wrapper.element.style.height).toEqual("16rem");
  });

  it("accepts a size attribute", () => {
    const wrapper = mount(ArtCircle, {
      propsData: {
        cardName: "Card Name",
        size: 10,
      },
    });

    expect(wrapper.element.style.width).toEqual("10rem");
    expect(wrapper.element.style.height).toEqual("10rem");
  });
});
