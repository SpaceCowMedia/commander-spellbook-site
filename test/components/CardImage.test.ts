import { mount } from "@vue/test-utils";
import CardImage from "@/components/CardImage.vue";

describe("CardImage", () => {
  it("creates a Flipper with a card back as the front side", () => {
    const wrapper = mount(CardImage, {
      propsData: {
        name: "Card Name",
        img: "https://example.com/image.png",
      },
    });

    expect(wrapper.find(".back-card").attributes("src")).toBe(
      "~/assets/images/card-back.png"
    );
    expect(wrapper.find(".back-card").attributes("alt")).toBe("");
  });

  it("creates a Flipper with a card image as the back side", () => {
    const wrapper = mount(CardImage, {
      propsData: {
        name: "Card Name",
        img: "https://example.com/image.png",
      },
    });

    expect(wrapper.find(".front-card").attributes("src")).toBe(
      "https://example.com/image.png"
    );
    expect(wrapper.find(".front-card").attributes("alt")).toBe("Card Name");
  });

  it("sets flipped state when card image loads and 300 milliseconds have passed", async () => {
    jest.useFakeTimers();

    const FlipperStub = {
      template:
        "<div><slot name='front'></slot><slot name='back'></slot></div>",
      props: ["flipped"],
    };
    const wrapper = mount(CardImage, {
      propsData: {
        name: "Card Name",
        img: "https://example.com/image.png",
      },
      stubs: {
        Flipper: FlipperStub,
      },
    });

    const flipper = wrapper.findComponent(FlipperStub);

    expect(flipper.props("flipped")).toBe(false);

    await wrapper.find(".front-card").trigger("load");

    expect(flipper.props("flipped")).toBe(false);

    await Promise.resolve().then(() => jest.advanceTimersByTime(300));

    expect(flipper.props("flipped")).toBe(true);
  });
});
