import { shallowMount, RouterLinkStub } from "@vue/test-utils";
import NoCombosFound from "@/components/search/NoCombosFound.vue";

import type { MountOptions } from "../../types";

describe("NoCombosFound", () => {
  it("shows looking up combos state when not loaded", () => {
    const SplashPageStub = {
      template: "<div><slot /></div>",
      props: [
        "title",
        "flavor",
        "pulse",
        "artCircleCardName",
        "artCircleArtistName",
      ],
    };
    const wrapper = shallowMount(NoCombosFound, {
      propsData: {
        loaded: false,
      },
      stubs: {
        SplashPage: SplashPageStub,
        NuxtLink: true,
      },
    });
    const splash = wrapper.findComponent(SplashPageStub);

    expect(splash.props("title")).toBe("Looking for Combos");
    expect(splash.props("flavor")).toBe(
      "It’s hard to say which is more satisfying: the search for that missing piece or fitting that piece into place."
    );
    expect(wrapper.find(".no-combos-found-buttons").classes("opacity-0")).toBe(
      true
    );
    expect(
      wrapper.find(".no-combos-found-buttons").classes("opacity-100")
    ).toBe(false);
  });

  it("shows no combos found view when loaded", () => {
    const SplashPageStub = {
      template: "<div><slot /></div>",
      props: [
        "title",
        "flavor",
        "pulse",
        "artCircleCardName",
        "artCircleArtistName",
      ],
    };
    const wrapper = shallowMount(NoCombosFound, {
      propsData: {
        loaded: true,
      },
      stubs: {
        SplashPage: SplashPageStub,
        NuxtLink: true,
      },
    });
    const splash = wrapper.findComponent(SplashPageStub);

    expect(splash.props("title")).toBe("No Combos Found");
    expect(splash.props("flavor")).toBe(
      "The final pages of the experiment log were blank. Investigators found it abandoned on a desk in the researcher’s lab, open, the pages flipping in the wind from a shattered window."
    );
    expect(wrapper.find(".no-combos-found-buttons").classes("opacity-0")).toBe(
      false
    );
    expect(
      wrapper.find(".no-combos-found-buttons").classes("opacity-100")
    ).toBe(true);
  });
});
