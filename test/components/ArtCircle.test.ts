import { mount } from "@vue/test-utils";
import type { VueComponent } from "../types";
import ArtCircle from "@/components/ArtCircle.vue";

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

  it("handles ' character in card name", () => {
    const wrapper = mount(ArtCircle, {
      propsData: {
        cardName: "Card's Name",
      },
    });

    // Not really sure what to do here to test the actual stuff
    // since the image requires get mocked in the jest moduleNameWrapper
    expect((wrapper.vm as VueComponent).computedStyle.backgroundImage).toBe(
      'url("file-name")'
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

    const el = wrapper.element as HTMLElement;

    expect(el.style.width).toEqual("16rem");
    expect(el.style.height).toEqual("16rem");
  });

  it("accepts a size attribute", () => {
    const wrapper = mount(ArtCircle, {
      propsData: {
        cardName: "Card Name",
        size: 10,
      },
    });

    const el = wrapper.element as HTMLElement;

    expect(el.style.width).toEqual("10rem");
    expect(el.style.height).toEqual("10rem");
  });
});
