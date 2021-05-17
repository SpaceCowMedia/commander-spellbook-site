import { shallowMount } from "@vue/test-utils";
import ShareComboButtons from "@/components/combo/ShareComboButtons.vue";

describe("ShareComboButtons", () => {
  it("creates a copy combo link button", () => {
    const CopyComboLinkButtonStub = {
      template: "<div></div>",
      props: ["combo-link"],
    };
    const wrapper = shallowMount(ShareComboButtons, {
      stubs: {
        CopyComboLinkButton: CopyComboLinkButtonStub,
        ShareNetwork: true,
      },
      propsData: {
        comboLink: "https://example.com/combo/123",
      },
      directives: {
        tooltip: {},
      },
    });

    expect(
      wrapper.findComponent(CopyComboLinkButtonStub).props("comboLink")
    ).toBe("https://example.com/combo/123");
  });

  it("creates social network buttons", () => {
    const ShareNetworkStub = {
      template: "<div></div>",
      props: ["url", "network"],
    };
    const wrapper = shallowMount(ShareComboButtons, {
      stubs: {
        ShareNetwork: ShareNetworkStub,
      },
      propsData: {
        comboLink: "https://example.com/combo/123",
      },
      directives: {
        tooltip: {},
      },
    });

    const buttons = wrapper.findAllComponents(ShareNetworkStub);

    expect(buttons.at(0).props("network")).toBe("Twitter");
    expect(buttons.at(0).props("url")).toBe("https://example.com/combo/123");

    expect(buttons.at(1).props("network")).toBe("Reddit");
    expect(buttons.at(1).props("url")).toBe("https://example.com/combo/123");

    expect(buttons.at(2).props("network")).toBe("Facebook");
    expect(buttons.at(2).props("url")).toBe("https://example.com/combo/123");
  });
});
