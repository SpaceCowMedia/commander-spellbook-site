import { shallowMount } from "@vue/test-utils";
import ErrorBaseComponent from "@/components/errors/error-base.vue";

import type { VueComponent } from "../../types";

describe("ErrorBaseComponent", () => {
  it("focuses on exit link upon mounting", () => {
    jest.spyOn(HTMLElement.prototype, "focus");

    const wrapper = shallowMount(ErrorBaseComponent, {
      propsData: {
        mainMessage: "Main",
        subMessage: "Sub",
        containerClass: "class-name",
      },
      stubs: {
        NuxtLink: true,
      },
    });

    expect((wrapper.vm as VueComponent).$refs.homeLink.$el.focus).toBeCalledTimes(1);
  });
});
