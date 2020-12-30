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

  it("defaults height and width class to 64", () => {
    const wrapper = mount(ArtCircle, {
      propsData: {
        cardName: "Card Name",
      },
    });

    expect(wrapper.classes()).toContain("h-64");
    expect(wrapper.classes()).toContain("w-64");
  });

  it("accepts a size attribute", () => {
    const wrapper = mount(ArtCircle, {
      propsData: {
        cardName: "Card Name",
        size: 10,
      },
    });

    expect(wrapper.classes()).toContain("h-10");
    expect(wrapper.classes()).toContain("w-10");
  });
});