import { mount } from "@vue/test-utils";
import CardGroup from "@/components/combo/CardGroup.vue";

import type { VueComponent } from "../../types";

describe("CardGroup", () => {
  it("sets card images", () => {
    const wrapper = mount(CardGroup, {
      propsData: {
        cards: [
          { name: "card 1", oracleImageUrl: "https://example.com/oracle1.png" },
          { name: "card 2", oracleImageUrl: "https://example.com/oracle2.png" },
          { name: "card 3", oracleImageUrl: "https://example.com/oracle3.png" },
        ],
      },
    });

    const imgs = wrapper.findAll(".card-img-wrapper img.front-card");

    expect(imgs.at(0).attributes("src")).toBe(
      "https://example.com/oracle1.png"
    );
    expect(imgs.at(1).attributes("src")).toBe(
      "https://example.com/oracle2.png"
    );
    expect(imgs.at(2).attributes("src")).toBe(
      "https://example.com/oracle3.png"
    );

    expect(imgs.at(0).attributes("src")).toBe(
      "https://example.com/oracle1.png"
    );
    expect(imgs.at(1).attributes("src")).toBe(
      "https://example.com/oracle2.png"
    );
    expect(imgs.at(2).attributes("src")).toBe(
      "https://example.com/oracle3.png"
    );
  });

  it("expands the card fourth from it's position when mouseovered", async () => {
    const wrapper = mount(CardGroup, {
      propsData: {
        cards: [
          { name: "card 1", oracleImageUrl: "https://example.com/oracle1.png" },
          { name: "card 2", oracleImageUrl: "https://example.com/oracle2.png" },
          { name: "card 3", oracleImageUrl: "https://example.com/oracle3.png" },
          { name: "card 4", oracleImageUrl: "https://example.com/oracle4.png" },
          { name: "card 5", oracleImageUrl: "https://example.com/oracle5.png" },
          { name: "card 6", oracleImageUrl: "https://example.com/oracle6.png" },
          { name: "card 7", oracleImageUrl: "https://example.com/oracle7.png" },
          { name: "card 8", oracleImageUrl: "https://example.com/oracle8.png" },
          { name: "card 9", oracleImageUrl: "https://example.com/oracle9.png" },
          {
            name: "card 10",
            oracleImageUrl: "https://example.com/oracle10.png",
          },
        ],
      },
    });
    const vm = wrapper.vm as VueComponent;

    const nodes = wrapper.findAll(".card-img-wrapper");

    expect(nodes.at(0).classes()).not.toContain("expand");
    expect(nodes.at(1).classes()).not.toContain("expand");
    expect(nodes.at(2).classes()).not.toContain("expand");
    expect(nodes.at(3).classes()).not.toContain("expand");
    expect(nodes.at(4).classes()).not.toContain("expand");
    expect(nodes.at(5).classes()).not.toContain("expand");
    expect(nodes.at(6).classes()).not.toContain("expand");
    expect(nodes.at(7).classes()).not.toContain("expand");
    expect(nodes.at(8).classes()).not.toContain("expand");
    expect(nodes.at(9).classes()).not.toContain("expand");

    await nodes.at(0).trigger("mouseover");
    expect(vm.hoveredOverCardIndex).toBe(0);

    expect(nodes.at(4).classes()).toContain("expand");
    expect(nodes.at(8).classes()).toContain("expand");
    expect(nodes.at(0).classes()).not.toContain("expand");
    expect(nodes.at(1).classes()).not.toContain("expand");
    expect(nodes.at(2).classes()).not.toContain("expand");
    expect(nodes.at(3).classes()).not.toContain("expand");
    expect(nodes.at(5).classes()).not.toContain("expand");
    expect(nodes.at(6).classes()).not.toContain("expand");
    expect(nodes.at(7).classes()).not.toContain("expand");
    expect(nodes.at(9).classes()).not.toContain("expand");

    await nodes.at(1).trigger("mouseover");
    expect(vm.hoveredOverCardIndex).toBe(1);

    expect(nodes.at(5).classes()).toContain("expand");
    expect(nodes.at(9).classes()).toContain("expand");
    expect(nodes.at(0).classes()).not.toContain("expand");
    expect(nodes.at(1).classes()).not.toContain("expand");
    expect(nodes.at(2).classes()).not.toContain("expand");
    expect(nodes.at(3).classes()).not.toContain("expand");
    expect(nodes.at(4).classes()).not.toContain("expand");
    expect(nodes.at(6).classes()).not.toContain("expand");
    expect(nodes.at(7).classes()).not.toContain("expand");
    expect(nodes.at(8).classes()).not.toContain("expand");

    await nodes.at(2).trigger("mouseover");
    expect(vm.hoveredOverCardIndex).toBe(2);

    expect(nodes.at(6).classes()).toContain("expand");
    expect(nodes.at(0).classes()).not.toContain("expand");
    expect(nodes.at(1).classes()).not.toContain("expand");
    expect(nodes.at(2).classes()).not.toContain("expand");
    expect(nodes.at(3).classes()).not.toContain("expand");
    expect(nodes.at(4).classes()).not.toContain("expand");
    expect(nodes.at(5).classes()).not.toContain("expand");
    expect(nodes.at(7).classes()).not.toContain("expand");
    expect(nodes.at(8).classes()).not.toContain("expand");
    expect(nodes.at(9).classes()).not.toContain("expand");

    await nodes.at(7).trigger("mouseover");
    expect(vm.hoveredOverCardIndex).toBe(7);

    expect(nodes.at(0).classes()).not.toContain("expand");
    expect(nodes.at(1).classes()).not.toContain("expand");
    expect(nodes.at(2).classes()).not.toContain("expand");
    expect(nodes.at(3).classes()).not.toContain("expand");
    expect(nodes.at(4).classes()).not.toContain("expand");
    expect(nodes.at(5).classes()).not.toContain("expand");
    expect(nodes.at(6).classes()).not.toContain("expand");
    expect(nodes.at(7).classes()).not.toContain("expand");
    expect(nodes.at(8).classes()).not.toContain("expand");
    expect(nodes.at(9).classes()).not.toContain("expand");
  });

  it("expands the card fourth from it's position when focused", async () => {
    const wrapper = mount(CardGroup, {
      // element needs to be in the DOM to get the focus event
      // https://stackoverflow.com/a/53042010/2601552
      attachTo: document.body,
      propsData: {
        cards: [
          { name: "card 1", oracleImageUrl: "https://example.com/oracle1.png" },
          { name: "card 2", oracleImageUrl: "https://example.com/oracle2.png" },
          { name: "card 3", oracleImageUrl: "https://example.com/oracle3.png" },
          { name: "card 4", oracleImageUrl: "https://example.com/oracle4.png" },
          { name: "card 5", oracleImageUrl: "https://example.com/oracle5.png" },
          { name: "card 6", oracleImageUrl: "https://example.com/oracle6.png" },
          { name: "card 7", oracleImageUrl: "https://example.com/oracle7.png" },
          { name: "card 8", oracleImageUrl: "https://example.com/oracle8.png" },
          { name: "card 9", oracleImageUrl: "https://example.com/oracle9.png" },
          {
            name: "card 10",
            oracleImageUrl: "https://example.com/oracle10.png",
          },
        ],
      },
    });
    const vm = wrapper.vm as VueComponent;

    const nodes = wrapper.findAll(".card-img-wrapper");

    expect(nodes.at(0).classes()).not.toContain("expand");
    expect(nodes.at(1).classes()).not.toContain("expand");
    expect(nodes.at(2).classes()).not.toContain("expand");
    expect(nodes.at(3).classes()).not.toContain("expand");
    expect(nodes.at(4).classes()).not.toContain("expand");
    expect(nodes.at(5).classes()).not.toContain("expand");
    expect(nodes.at(6).classes()).not.toContain("expand");
    expect(nodes.at(7).classes()).not.toContain("expand");
    expect(nodes.at(8).classes()).not.toContain("expand");
    expect(nodes.at(9).classes()).not.toContain("expand");

    await nodes.at(0).find("a").trigger("focus");
    expect(vm.hoveredOverCardIndex).toBe(0);

    expect(nodes.at(4).classes()).toContain("expand");
    expect(nodes.at(8).classes()).toContain("expand");
    expect(nodes.at(0).classes()).not.toContain("expand");
    expect(nodes.at(1).classes()).not.toContain("expand");
    expect(nodes.at(2).classes()).not.toContain("expand");
    expect(nodes.at(3).classes()).not.toContain("expand");
    expect(nodes.at(5).classes()).not.toContain("expand");
    expect(nodes.at(6).classes()).not.toContain("expand");
    expect(nodes.at(7).classes()).not.toContain("expand");
    expect(nodes.at(9).classes()).not.toContain("expand");

    await nodes.at(1).find("a").trigger("focus");
    expect(vm.hoveredOverCardIndex).toBe(1);

    expect(nodes.at(5).classes()).toContain("expand");
    expect(nodes.at(9).classes()).toContain("expand");
    expect(nodes.at(0).classes()).not.toContain("expand");
    expect(nodes.at(1).classes()).not.toContain("expand");
    expect(nodes.at(2).classes()).not.toContain("expand");
    expect(nodes.at(3).classes()).not.toContain("expand");
    expect(nodes.at(4).classes()).not.toContain("expand");
    expect(nodes.at(6).classes()).not.toContain("expand");
    expect(nodes.at(7).classes()).not.toContain("expand");
    expect(nodes.at(8).classes()).not.toContain("expand");

    await nodes.at(2).find("a").trigger("focus");
    expect(vm.hoveredOverCardIndex).toBe(2);

    expect(nodes.at(6).classes()).toContain("expand");
    expect(nodes.at(0).classes()).not.toContain("expand");
    expect(nodes.at(1).classes()).not.toContain("expand");
    expect(nodes.at(2).classes()).not.toContain("expand");
    expect(nodes.at(3).classes()).not.toContain("expand");
    expect(nodes.at(4).classes()).not.toContain("expand");
    expect(nodes.at(5).classes()).not.toContain("expand");
    expect(nodes.at(7).classes()).not.toContain("expand");
    expect(nodes.at(8).classes()).not.toContain("expand");
    expect(nodes.at(9).classes()).not.toContain("expand");

    await nodes.at(7).find("a").trigger("focus");
    expect(vm.hoveredOverCardIndex).toBe(7);

    expect(nodes.at(0).classes()).not.toContain("expand");
    expect(nodes.at(1).classes()).not.toContain("expand");
    expect(nodes.at(2).classes()).not.toContain("expand");
    expect(nodes.at(3).classes()).not.toContain("expand");
    expect(nodes.at(4).classes()).not.toContain("expand");
    expect(nodes.at(5).classes()).not.toContain("expand");
    expect(nodes.at(6).classes()).not.toContain("expand");
    expect(nodes.at(7).classes()).not.toContain("expand");
    expect(nodes.at(8).classes()).not.toContain("expand");
    expect(nodes.at(9).classes()).not.toContain("expand");
  });

  it("centers cards when there are less than 4", async () => {
    const cards = [
      { name: "card 1", oracleImageUrl: "https://example.com/oracle1.png" },
      { name: "card 2", oracleImageUrl: "https://example.com/oracle2.png" },
      { name: "card 3", oracleImageUrl: "https://example.com/oracle3.png" },
    ];
    const wrapper = mount(CardGroup, {
      propsData: {
        cards,
      },
    });

    expect(wrapper.find(".card-images").classes()).toContain("justify-center");

    await wrapper.setProps({
      cards: [
        { name: "card 1", oracleImageUrl: "https://example.com/oracle1.png" },
        { name: "card 2", oracleImageUrl: "https://example.com/oracle2.png" },
        { name: "card 3", oracleImageUrl: "https://example.com/oracle3.png" },
        { name: "card 4", oracleImageUrl: "https://example.com/oracle4.png" },
      ],
    });

    expect(wrapper.find(".card-images").classes()).not.toContain(
      "justify-center"
    );
  });
});
