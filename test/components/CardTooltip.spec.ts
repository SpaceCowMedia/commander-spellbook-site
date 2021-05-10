import { shallowMount } from "@vue/test-utils";
import CardTooltip from "@/components/CardTooltip.vue";
import getExternalCardData from "@/lib/get-external-card-data";

import { mocked } from "ts-jest/utils";

jest.mock("@/lib/get-external-card-data");

describe("CardTooltip", () => {
  let options: Parameters<typeof shallowMount>[1];

  beforeEach(() => {
    options = {
      propsData: {
        cardName: "Sydri",
      },
      slots: {
        default: "<div></div>",
      },
    };
    mocked(getExternalCardData).mockReturnValue({
      isBanned: false,
      isPreview: false,
      isFeatured: false,
      images: {
        oracle: "https://c1.scryfall.com/file/oracle.jpg",
        artCrop: "https://c1.scryfall.com/file/art.jpg",
      },
      prices: {
        tcgplayer: 123,
        cardkingdom: 456,
      },
      edhrecLink: "https//edhrec.com/card",
    });
  });

  it("is hidden by default", () => {
    const wrapper = shallowMount(CardTooltip, options);

    expect(wrapper.find(".card-tooltip").exists()).toBe(false);
  });

  it("reveals and hides tooltip on mousemove and mouseout", async () => {
    const wrapper = shallowMount(CardTooltip, options);

    await wrapper.find("span").trigger("mousemove");
    expect(wrapper.find(".card-tooltip").exists()).toBe(true);
    const img = wrapper.find("img");
    expect(img.attributes("alt")).toBe("Sydri");
    expect(img.attributes("src")).toBe(
      "https://c1.scryfall.com/file/oracle.jpg"
    );

    await wrapper.find("span").trigger("mouseout");
    expect(wrapper.find(".card-tooltip").exists()).toBe(false);
  });

  it("sets the tooltip position based on the mousemove event", async () => {
    const wrapper = shallowMount(CardTooltip, options);

    await wrapper.find("span").trigger("mousemove", {
      clientX: 23,
      clientY: 12,
    });
    expect(wrapper.find(".card-tooltip").element.style.left).toBe("73px");
    expect(wrapper.find(".card-tooltip").element.style.top).toBe("-18px");
  });
});
