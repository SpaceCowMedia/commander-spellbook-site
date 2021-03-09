import { mount } from "@vue/test-utils";
import Select from "@/components/Select.vue";

describe("Select", () => {
  it("con configure background class for select", async () => {
    const wrapper = mount(Select);

    expect(wrapper.classes()).toContain("bg-primary");
    expect(wrapper.classes()).not.toContain("bg-red-100");

    await wrapper.setProps({
      selectBackgroundClass: "bg-red-100",
    });

    expect(wrapper.classes()).not.toContain("bg-primary");
    expect(wrapper.classes()).toContain("bg-red-100");
  });

  it("con configure text class for select", async () => {
    const wrapper = mount(Select);

    expect(wrapper.find("select").classes()).toContain("text-white");
    expect(wrapper.find("select").classes()).not.toContain("text-red-100");

    await wrapper.setProps({
      selectTextClass: "text-red-100",
    });

    expect(wrapper.find("select").classes()).not.toContain("text-white");
    expect(wrapper.find("select").classes()).toContain("text-red-100");
  });
});
