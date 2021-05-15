import { shallowMount } from "@vue/test-utils";
import Tooltip from "@/components/Tooltip.vue";

describe("Tooltip", () => {
  let options: Parameters<typeof shallowMount>[1];

  beforeEach(() => {
    options = {
      slots: {
        tooltip: "<div class='tooltip-slot'>tooltip</div>",
        content: "<div class='content-slot'>content</div>",
      },
    };
  });

  it("is hidden by default", () => {
    const wrapper = shallowMount(Tooltip, options);

    expect(wrapper.find(".content-slot").exists()).toBe(true);
    expect(wrapper.find(".tooltip-slot").exists()).toBe(false);
  });

  it("reveals and hides tooltip on mousemove and mouseout", async () => {
    const wrapper = shallowMount(Tooltip, options);

    await wrapper.find("span").trigger("mousemove");
    expect(wrapper.find(".tooltip-slot").exists()).toBe(true);

    await wrapper.find("span").trigger("mouseout");
    expect(wrapper.find(".tooltip-slot").exists()).toBe(false);
  });

  it("sets the tooltip position based on the mousemove event and window width", async () => {
    const wrapper = shallowMount(Tooltip, options);
    const halfWindowSize = Math.floor(window.innerWidth / 2);
    const mouseOnLeftSide = halfWindowSize - 10;
    const mouseOnRightSide = halfWindowSize + 10;

    await wrapper.find("span").trigger("mousemove", {
      clientX: mouseOnLeftSide,
      clientY: 12,
    });
    expect(wrapper.find(".tooltip").element.style.left).toBe(
      `${mouseOnLeftSide + 50}px`
    );
    expect(wrapper.find(".tooltip").element.style.top).toBe("-18px");

    await wrapper.find("span").trigger("mousemove", {
      clientX: mouseOnRightSide,
      clientY: 50,
    });
    expect(wrapper.find(".tooltip").element.style.left).toBe(
      `${mouseOnRightSide - 50}px`
    );
    expect(wrapper.find(".tooltip").element.style.top).toBe("20px");
  });

  it("can set a custom right side offset", async () => {
    // @ts-ignore
    options.propsData = {
      rightOffset: 30,
    };
    const wrapper = shallowMount(Tooltip, options);
    const halfWindowSize = Math.floor(window.innerWidth / 2);
    const mousePosition = halfWindowSize - 10;

    await wrapper.find("span").trigger("mousemove", {
      clientX: mousePosition,
      clientY: 12,
    });
    expect(wrapper.find(".tooltip").element.style.left).toBe(
      `${mousePosition + 30}px`
    );
    expect(wrapper.find(".tooltip").element.style.top).toBe("-18px");
  });

  it("can set a custom left side offset", async () => {
    // @ts-ignore
    options.propsData = {
      leftOffset: 30,
    };
    const wrapper = shallowMount(Tooltip, options);
    const halfWindowSize = Math.floor(window.innerWidth / 2);
    const mousePosition = halfWindowSize + 10;

    await wrapper.find("span").trigger("mousemove", {
      clientX: mousePosition,
      clientY: 12,
    });
    expect(wrapper.find(".tooltip").element.style.left).toBe(
      `${mousePosition - 30}px`
    );
    expect(wrapper.find(".tooltip").element.style.top).toBe("-18px");
  });
});
