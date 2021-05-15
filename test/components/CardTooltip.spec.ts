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

  it("adds card image as the tooltip", () => {
    const wrapper = shallowMount(CardTooltip, options);

    expect(wrapper.find(".card-tooltip").exists()).toBe(true);
    const img = wrapper.find("img");
    expect(img.attributes("alt")).toBe("Sydri");
    expect(img.attributes("src")).toBe(
      "https://c1.scryfall.com/file/oracle.jpg"
    );
  });
});
