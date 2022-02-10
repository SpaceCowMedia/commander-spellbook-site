import { shallowMount } from "@vue/test-utils";
import CardTooltip from "@/components/CardTooltip.vue";
import getExternalCardData from "@/lib/get-external-card-data";

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
    jest.mocked(getExternalCardData).mockReturnValue({
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

  it("sets the tooltip position based on the mousemove event and window width", async () => {
    const wrapper = shallowMount(CardTooltip, options);
    const halfWindowSize = Math.floor(window.innerWidth / 2);
    const mouseOnLeftSide = halfWindowSize - 10;
    const mouseOnRightSide = halfWindowSize + 10;

    await wrapper.find("span").trigger("mousemove", {
      clientX: mouseOnLeftSide,
      clientY: 12,
    });
    const el = wrapper.find(".card-tooltip").element as HTMLElement;

    expect(el.style.left).toBe(`${mouseOnLeftSide + 50}px`);
    expect(el.style.top).toBe("-18px");

    await wrapper.find("span").trigger("mousemove", {
      clientX: mouseOnRightSide,
      clientY: 50,
    });
    expect(el.style.left).toBe(`${mouseOnRightSide - 290}px`);
    expect(el.style.top).toBe("20px");
  });
});
