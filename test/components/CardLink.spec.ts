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
      "https://scryfall.com/search?q=name%3D%22Card%20Name%22"
    );
  });

  it("uses single quotes if card name contains double qotes", () => {
    const wrapper = mount(CardLink, {
      propsData: {
        name: 'Card Name with "quotes"',
      },
    });

    expect(wrapper.find("a").attributes("href")).toBe(
      "https://scryfall.com/search?q=name%3D%27Card%20Name%20with%20%22quotes%22%27"
    );
  });

  it("defaults target to _blank", () => {
    expect(
      mount(CardLink, {
        propsData: {
          name: "Card Name",
        },
      })
        .find("a")
        .attributes("target")
    ).toBe("_blank");

    expect(
      mount(CardLink, {
        propsData: {
          name: "Card Name",
          target: "_top",
        },
      })
        .find("a")
        .attributes("target")
    ).toBe("_top");
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
