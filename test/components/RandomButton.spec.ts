import { mount, RouterLinkStub } from "@vue/test-utils";
import RandomButton from "@/components/RandomButton.vue";

describe("RandomButton", () => {
  it("sets link to random path", () => {
    const wrapper = mount(RandomButton, {
      stubs: {
        NuxtLink: RouterLinkStub,
      },
    });

    expect(wrapper.findComponent(RouterLinkStub).props("to")).toEqual({
      path: "/random/",
    });
  });

  it("includes query in link when provided", () => {
    const wrapper = mount(RandomButton, {
      stubs: {
        NuxtLink: RouterLinkStub,
      },
      propsData: {
        query: "search",
      },
    });

    expect(wrapper.findComponent(RouterLinkStub).props("to")).toEqual({
      path: "/random/",
      query: {
        q: "search",
      },
    });
  });
});
