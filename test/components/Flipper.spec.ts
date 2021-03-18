import { shallowMount } from "@vue/test-utils";
import Flipper from "@/components/Flipper.vue";

describe("Flipper", () => {
  it("creates a flipper with a front and back slot", () => {
    const wrapper = shallowMount(Flipper, {
      slots: {
        front: '<div class="front-slot"></div>',
        back: '<div class="back-slot"></div>',
      },
    });

    expect(wrapper.find(".front-slot").exists()).toBeTruthy();
    expect(wrapper.find(".back-slot").exists()).toBeTruthy();
  });

  it("applies flipped class from prop", async () => {
    const wrapper = shallowMount(Flipper);

    expect(wrapper.classes()).not.toContain("flipped");

    await wrapper.setProps({
      flipped: true,
    });

    expect(wrapper.classes()).toContain("flipped");
  });
});
