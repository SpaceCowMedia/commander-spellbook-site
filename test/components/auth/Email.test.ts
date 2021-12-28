import { shallowMount } from "@vue/test-utils";
import Email from "@/components/auth/Email.vue";
import { createRouter, createStore } from "../../utils";

import type { Router, Store, VueComponent } from "../../types";

describe("Email Auth", () => {
  let $router: Router;
  let $store: Store;

  beforeEach(() => {
    $router = createRouter();
    $store = createStore();
  });

  it("calls requestMagicLink when form submits", () => {
    const wrapper = shallowMount(Email, {
      mocks: {
        $router,
        $store,
      },
      stubs: {
        ErrorMessage: true,
      },
      propsData: {
        submitButtonText: "submit",
      },
    });

    const spy = jest.spyOn(wrapper.vm as VueComponent, "requestMagicLink");

    wrapper.find("form").trigger("submit");

    expect(spy).toBeCalledTimes(1);
  });

  it("configures informational text in form", () => {
    const wrapper = shallowMount(Email, {
      mocks: {
        $router,
        $store,
      },
      stubs: {
        ErrorMessage: true,
      },
      propsData: {
        promptText: "prompt text",
        submitButtonText: "submit text",
      },
    });

    expect(wrapper.find(".prompt-text").text()).toContain("prompt text");
    expect(wrapper.find("button").text()).toContain("submit text");
  });

  it("shows email error message when an error is present", async () => {
    const ErrorMessageStub = {
      props: ["message"],
      template: "<div></div>",
    };
    const wrapper = shallowMount(Email, {
      mocks: {
        $router,
        $store,
      },
      stubs: {
        ErrorMessage: ErrorMessageStub,
      },
    });

    await wrapper.setData({
      emailError: "error message",
    });

    expect(
      wrapper.findAllComponents(ErrorMessageStub).at(0).props("message")
    ).toBe("error message");
  });

  it("shows display name error message when an error is present", async () => {
    const ErrorMessageStub = {
      props: ["message"],
      template: "<div></div>",
    };
    const wrapper = shallowMount(Email, {
      mocks: {
        $router,
        $store,
      },
      stubs: {
        ErrorMessage: ErrorMessageStub,
      },
      propsData: {
        includeDisplayName: true,
      },
    });

    await wrapper.setData({
      displayNameError: "error message",
    });

    expect(
      wrapper.findAllComponents(ErrorMessageStub).at(1).props("message")
    ).toBe("error message");
  });

  describe("requestMagicLink", () => {
    it("dispatches auth/requestMagicLink action", async () => {
      const wrapper = shallowMount(Email, {
        mocks: {
          $router,
          $store,
        },
        stubs: {
          ErrorMessage: true,
        },
      });
      const vm = wrapper.vm as VueComponent;

      await wrapper.setData({
        email: "arjun@example.com",
      });

      await vm.requestMagicLink();

      expect($store.dispatch).toBeCalledTimes(1);
      expect($store.dispatch).toBeCalledWith("auth/requestMagicLink", {
        email: "arjun@example.com",
        displayName: "",
      });
    });

    it("does not dispatch auth/requestMagicLink action if display name is included and it is not entered", async () => {
      const wrapper = shallowMount(Email, {
        mocks: {
          $router,
          $store,
        },
        stubs: {
          ErrorMessage: true,
        },
        propsData: {
          includeDisplayName: true,
        },
      });

      const vm = wrapper.vm as VueComponent;

      await wrapper.setData({
        email: "arjun@example.com",
      });

      wrapper.find("form").trigger("submit");

      expect($store.dispatch).toBeCalledTimes(0);
      expect(vm.displayNameError).toBe("Display name cannot be empty.");
    });

    it("does not dispatch auth/requestMagicLink action if email name is not entered", () => {
      const wrapper = shallowMount(Email, {
        mocks: {
          $router,
          $store,
        },
        stubs: {
          ErrorMessage: true,
        },
      });

      const vm = wrapper.vm as VueComponent;

      wrapper.find("form").trigger("submit");

      expect($store.dispatch).toBeCalledTimes(0);
      expect(vm.emailError).toBe("Email cannot be empty.");
    });

    it("dispatches auth/requestMagicLink action with display name if included", async () => {
      const wrapper = shallowMount(Email, {
        mocks: {
          $router,
          $store,
        },
        stubs: {
          ErrorMessage: true,
        },
        propsData: {
          includeDisplayName: true,
        },
      });

      await wrapper.setData({
        email: "arjun@example.com",
        displayName: "Arjun",
      });

      wrapper.find("form").trigger("submit");

      expect($store.dispatch).toBeCalledTimes(1);
      expect($store.dispatch).toBeCalledWith("auth/requestMagicLink", {
        email: "arjun@example.com",
        displayName: "Arjun",
      });
    });

    it("removes error messages if they already exist", async () => {
      const wrapper = shallowMount(Email, {
        mocks: {
          $router,
          $store,
        },
        stubs: {
          ErrorMessage: true,
        },
      });
      const vm = wrapper.vm as VueComponent;

      await wrapper.setData({
        emailError: "email error message",
        displayNameError: "display name error",
        email: "arjun@example.com",
      });

      await vm.requestMagicLink();

      expect(vm.emailError).toBe("");
      expect(vm.displayNameError).toBe("");
    });

    it("sets component to completed state when dispatch is sent", async () => {
      const wrapper = shallowMount(Email, {
        mocks: {
          $router,
          $store,
        },
        stubs: {
          ErrorMessage: true,
        },
        propsData: {
          linkSentText: "link sent text",
        },
      });
      const vm = wrapper.vm as VueComponent;

      await wrapper.setData({
        email: "arjun@example.com",
      });

      await vm.requestMagicLink();

      expect($router.push).not.toBeCalled();
      expect(wrapper.find("form").exists()).toBeFalsy();
      expect(wrapper.find("div").text()).toContain("link sent text");
    });

    it("redirects to /email-link-sent/ if no completion text is passed", async () => {
      const wrapper = shallowMount(Email, {
        mocks: {
          $router,
          $store,
        },
        stubs: {
          ErrorMessage: true,
        },
      });
      const vm = wrapper.vm as VueComponent;

      await wrapper.setData({
        email: "arjun@example.com",
      });

      await vm.requestMagicLink();

      expect($router.push).toBeCalledTimes(1);
      expect($router.push).toBeCalledWith("/email-link-sent/");
      expect(vm.linkSent).toBe(false);
    });

    it("sets email error message when log in fails", async () => {
      const wrapper = shallowMount(Email, {
        mocks: {
          $router,
          $store,
        },
        stubs: {
          ErrorMessage: true,
        },
      });
      const vm = wrapper.vm as VueComponent;

      await wrapper.setData({
        email: "arjun@example.com",
      });
      $store.dispatch.mockRejectedValue(new Error("some validation error"));

      await vm.requestMagicLink();

      expect(vm.emailError).toBe("some validation error");
    });
  });
});
