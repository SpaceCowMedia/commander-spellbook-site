import { shallowMount, RouterLinkStub } from "@vue/test-utils";
import SearchSnippet from "@/components/syntax-guide/SearchSnippet.vue";

describe("SearchSnippet", () => {
  it("adds link for search snippet", () => {
    const wrapper = shallowMount(SearchSnippet, {
      propsData: {
        search: "ci:wub card:mind",
        description: "description",
      },
      stubs: {
        NuxtLink: RouterLinkStub,
      },
    });

    const link = wrapper.findComponent(RouterLinkStub);

    expect(link.props("to")).toBe("/search?q=ci:wub card:mind");
  });

  it("renders search and description", () => {
    const wrapper = shallowMount(SearchSnippet, {
      propsData: {
        search: "ci:wub card:mind",
        description: "description",
      },
      stubs: {
        NuxtLink: RouterLinkStub,
      },
    });

    const search = wrapper.find("pre");
    const description = wrapper.find(".description");

    expect(search.text()).toBe("ci:wub card:mind");
    expect(description.text()).toBe("description");
  });
});
