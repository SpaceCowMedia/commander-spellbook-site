import { mount } from "@vue/test-utils";
import CardLink from "@/components/CardLink.vue";
import Card from "@/lib/api/models/card";

describe("CardLink", () => {
  it("creates an edhrec link from name", () => {
    jest
      .spyOn(Card.prototype, "getEdhrecLink")
      .mockReturnValue("https://edhrec.com/card-name");

    const wrapper = mount(CardLink, {
      propsData: {
        name: "Card Name",
      },
    });

    expect(wrapper.find("a").attributes("href")).toBe(
      "https://edhrec.com/card-name"
    );
  });

  it("falls back to scryfall link when edhrec link is not avialable", () => {
    jest.spyOn(Card.prototype, "getEdhrecLink").mockReturnValue("");

    const wrapper = mount(CardLink, {
      propsData: {
        name: "Card Name",
      },
    });

    expect(wrapper.find("a").attributes("href")).toContain(
      "https://scryfall.com/search?q=%21%22Card%20Name%22"
    );
  });

  it("uses single quotes for scryhfall link if card name contains double qotes", () => {
    jest.spyOn(Card.prototype, "getEdhrecLink").mockReturnValue("");

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
      // element needs to be in the DOM to get the focus event
      // https://stackoverflow.com/a/53042010/2601552
      attachTo: document.body,
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
