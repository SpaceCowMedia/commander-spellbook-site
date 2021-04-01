import { mount } from "@vue/test-utils";
import CardLink from "@/components/CardLink.vue";

describe("CardLink", () => {
  it("creates a scryfall link from name", () => {
    const wrapper = mount(CardLink, {
      propsData: {
        name: "Card Name",
      },
    });

    expect(wrapper.find("a").attributes("href")).toBe(
      "https://scryfall.com/search?q=%21%22Card%20Name%22"
    );
  });

  it("uses single quotes if card name contains double qotes", () => {
    const wrapper = mount(CardLink, {
      propsData: {
        name: 'Card Name with "quotes"',
      },
    });

    expect(wrapper.find("a").attributes("href")).toBe(
      "https://scryfall.com/search?q=%21%27Card%20Name%20with%20%22quotes%22%27"
    );
  });

  it("passes on focus event to component using cardlink", async () => {
    const spy = jest.fn();
    const wrapper = mount(CardLink, {
      propsData: {
        name: "Card Name",
      },
      mocks: {
        $emit: spy,
      },
    });

    await wrapper.find("a").trigger("focus");

    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith("focus");
  });
});
