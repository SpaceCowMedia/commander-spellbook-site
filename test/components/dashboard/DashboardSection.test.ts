import { shallowMount } from "@vue/test-utils";
import DashboardSection from "@/components/dashboard/DashboardSection.vue";

describe("DashboardSection", () => {
  it("configures title", () => {
    const wrapper = shallowMount(DashboardSection, {
      propsData: {
        title: "Section Title",
      },
    });

    expect(wrapper.find("h2").text()).toBe("Section Title");
  });
});
