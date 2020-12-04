import { shallowMount } from "@vue/test-utils";
import CardTooltip from "@/components/CardTooltip.vue";

describe("CardTooltip", () => {
  let options;

  beforeEach(() => {
    options = {
      propsData: {
        cardName: "Sydri",
      },
      slots: {
        default: "<div></div>",
      },
    };
  });

  it("is hidden by default", () => {
    const wrapper = shallowMount(CardTooltip, options);

    expect(wrapper.find(".card-tooltip").exists()).toBe(false);
  });

  it("reveals and hides tooltip on mousemove and mouseout", async () => {
    const wrapper = shallowMount(CardTooltip, options);

    await wrapper.find("span").trigger("mousemove");
    expect(wrapper.find(".card-tooltip").exists()).toBe(true);
    expect(wrapper.find(".card-tooltip img").element.src).toBe(
      "https://api.scryfall.com/cards/named?exact=Sydri&format=image"
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
