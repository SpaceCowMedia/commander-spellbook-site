import { mount } from "@vue/test-utils";
import ErrorMessage from "@/components/ErrorMessage.vue";

describe("ErrorMessage", () => {
  it("can be configured with an error message", () => {
    const wrapper = mount(ErrorMessage, {
      propsData: {
        message: "message",
      },
    });

    expect(wrapper.find(".error-message").text()).toContain("message");
  });

  it("provides a default title", () => {
    const wrapper = mount(ErrorMessage, {});

    expect(wrapper.find(".error-title").text()).toContain(
      "Something went wrong"
    );
  });

  it("can customize the title", () => {
    const wrapper = mount(ErrorMessage, {
      propsData: {
        title: "Custom Title",
      },
    });

    expect(wrapper.find(".error-title").text()).toContain("Custom Title");
  });

  it("emits a close event x button is clicked", () => {
    const spy = jest.fn();
    const wrapper = mount(ErrorMessage, {
      mocks: {
        $emit: spy,
      },
    });

    wrapper.find(".close-icon").trigger("click");

    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith("close");
  });
});
