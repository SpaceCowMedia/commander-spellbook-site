import { shallowMount } from "@vue/test-utils";
import SplashPage from "@/components/SplashPage.vue";

describe("SplashPage", () => {
  it("passes along title and flavor", () => {
    const wrapper = shallowMount(SplashPage, {
      stubs: {
        ArtCircle: true,
      },
      propsData: {
        title: "Title",
        flavor: "Flavor text",
      },
    });

    expect(wrapper.find(".heading-title").text()).toBe("Title");
    expect(wrapper.find(".flavor-text").text()).toBe("Flavor text");
  });

  it("creates an ArtCircle component", () => {
    const ArtCircleStub = {
      template: "<div></div>",
      props: ["cardName", "artist"],
    };
    const wrapper = shallowMount(SplashPage, {
      stubs: {
        ArtCircle: ArtCircleStub,
      },
      propsData: {
        artCircleCardName: "Card Name",
        artCircleArtistName: "Artist Name",
      },
    });
    const art = wrapper.findComponent(ArtCircleStub);

    expect(art.props("cardName")).toBe("Card Name");
    expect(art.props("artist")).toBe("Artist Name");
  });

  it("does not include pulse animation by default", () => {
    const wrapper = shallowMount(SplashPage, {
      stubs: {
        ArtCircle: true,
      },
    });

    expect(wrapper.find(".animate-pulse").exists()).toBe(false);
  });

  it("can configure splash  page to have pulse animation", () => {
    const wrapper = shallowMount(SplashPage, {
      stubs: {
        ArtCircle: true,
      },
      propsData: {
        pulse: true,
      },
    });

    expect(wrapper.find(".animate-pulse").exists()).toBe(true);
  });
});
