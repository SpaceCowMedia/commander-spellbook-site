import { shallowMount, RouterLinkStub } from "@vue/test-utils";
import SearchGuide from "@/components/syntax-guide/SearchGuide.vue";

describe("SearchGuide", () => {
  it("renders a search guide", () => {
    const wrapper = shallowMount(SearchGuide, {
      slots: {
        default: `<template><p>Foo Bar Baz</p></template>`,
      },
      propsData: {
        heading: "Search Heading",
      },
      stubs: {
        SearchSnippet: true,
        ArtCircle: true,
      },
    });

    const heading = wrapper.find(".heading-title");
    const description = wrapper.find(".description p");

    expect(heading.text()).toBe("Search Heading");
    expect(description.text()).toBe("Foo Bar Baz");
  });

  it("renders an art circle", () => {
    const ArtCircle = {
      template: "<div></div>",
      props: {
        artist: String,
        cardName: String,
        size: Number,
      },
    };
    const wrapper = shallowMount(SearchGuide, {
      propsData: {
        headingCardName: "Card Name",
        headingArtistName: "Given Sur",
      },
      stubs: {
        SearchSnippet: true,
        ArtCircle,
      },
    });

    const circle = wrapper.findComponent(ArtCircle);

    expect(circle.props("artist")).toBe("Given Sur");
    expect(circle.props("cardName")).toBe("Card Name");
    expect(circle.props("size")).toBe(28);
  });

  it("renders search snippets", () => {
    const SearchSnippet = {
      template: "<div></div>",
      props: {
        search: String,
        description: String,
      },
    };
    const wrapper = shallowMount(SearchGuide, {
      propsData: {
        snippets: [
          {
            search: "search 1",
            description: "description 1",
          },
          {
            search: "search 2",
            description: "description 2",
          },
          {
            search: "search 3",
            description: "description 3",
          },
        ],
      },
      stubs: {
        SearchSnippet,
        ArtCircle: true,
      },
    });

    const snippets = wrapper.findAllComponents(SearchSnippet);

    expect(snippets.length).toBe(3);
    expect(snippets.at(0).props("search")).toBe("search 1");
    expect(snippets.at(0).props("description")).toBe("description 1");
    expect(snippets.at(1).props("search")).toBe("search 2");
    expect(snippets.at(1).props("description")).toBe("description 2");
    expect(snippets.at(2).props("search")).toBe("search 3");
    expect(snippets.at(2).props("description")).toBe("description 3");
  });
});
