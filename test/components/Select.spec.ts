import { mount } from "@vue/test-utils";
import Select from "@/components/Select.vue";

describe("Select", () => {
  it("applies danger class when it has an error", async () => {
    const wrapper = mount(Select);

    expect(wrapper.classes()).toContain("bg-primary");
    expect(wrapper.classes()).not.toContain("bg-danger");

    await wrapper.setProps({
      error: "some error",
    });

    expect(wrapper.classes()).not.toContain("bg-primary");
    expect(wrapper.classes()).toContain("bg-danger");
  });
});
