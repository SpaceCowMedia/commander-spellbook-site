import { mount } from "@vue/test-utils";
import ExternalLink from "@/components/ExternalLink.vue";

describe("ExternalLink", () => {
  it("creates a link", () => {
    expect(
      mount(ExternalLink, {
        propsData: {
          to: "https://example.com",
        },
      })
        .find("a")
        .attributes("href")
    ).toBe("https://example.com");
  });

  it("defaults target to _blank", () => {
    expect(
      mount(ExternalLink, {
        propsData: {
          to: "https://example.com",
        },
      })
        .find("a")
        .attributes("target")
    ).toBe("_blank");

    expect(
      mount(ExternalLink, {
        propsData: {
          to: "https://example.com",
          target: "_top",
        },
      })
        .find("a")
        .attributes("target")
    ).toBe("_top");
  });

  it("does not include an href prop if disabled", () => {
    expect(
      mount(ExternalLink, {
        propsData: {
          to: "https://example.com",
          disabled: true,
        },
      })
        .find("a")
        .attributes("href")
    ).toBeFalsy();
  });

  it("passes on focus event to component using it", async () => {
    const spy = jest.fn();
    const wrapper = mount(ExternalLink, {
      // element needs to be in the DOM to get the focus event
      // https://stackoverflow.com/a/53042010/2601552
      attachTo: document.body,
      propsData: {
        to: "https://example.com",
      },
      mocks: {
        $emit: spy,
      },
    });

    await wrapper.find("a").trigger("focus");

    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith("focus");
  });

  it("passes on click event to component using it", async () => {
    const spy = jest.fn();
    const wrapper = mount(ExternalLink, {
      propsData: {
        to: "https://example.com",
      },
      mocks: {
        $emit: spy,
      },
    });

    await wrapper.find("a").trigger("click");

    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith("click");
  });
});
