import { mount } from "@vue/test-utils";
import StyledSelect from "@/components/StyledSelect.vue";

describe("StyledSelect", () => {
  it("con configure background class for select", async () => {
    const wrapper = mount(StyledSelect);

    expect(wrapper.classes()).toContain("border");
    expect(wrapper.classes()).toContain("border-dark");
    expect(wrapper.classes()).not.toContain("bg-red-100");

    await wrapper.setProps({
      selectBackgroundClass: "bg-red-100",
    });

    expect(wrapper.classes()).not.toContain("border");
    expect(wrapper.classes()).not.toContain("border-dark");
    expect(wrapper.classes()).toContain("bg-red-100");
  });

  it("con configure text class for select", async () => {
    const wrapper = mount(StyledSelect);

    expect(wrapper.find("select").classes()).toContain("text-dark");
    expect(wrapper.find("select").classes()).not.toContain("text-red-100");

    await wrapper.setProps({
      selectTextClass: "text-red-100",
    });

    expect(wrapper.find("select").classes()).not.toContain("text-dark");
    expect(wrapper.find("select").classes()).toContain("text-red-100");
  });
});
