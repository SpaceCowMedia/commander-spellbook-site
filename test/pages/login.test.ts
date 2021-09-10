import { shallowMount } from "@vue/test-utils";
import LoginPage from "@/pages/login.vue";
import { createStore } from "../utils";

import type { Store, Router, VueComponent } from "../types";

describe("LoginPage", () => {
  let $router: Router, $store: Store;

  beforeEach(() => {
    $router = {
      push: jest.fn(),
      replace: jest.fn(),
    };
    $store = createStore();
  });

  it("calls userSignIn when form submits", () => {
    const wrapper = shallowMount(LoginPage, {
      mocks: {
        $store,
        $router,
      },
      stubs: {
        ErrorMessage: true,
        NuxtLink: true,
      },
    });

    const spy = jest.spyOn(wrapper.vm as VueComponent, "userSignIn");

    wrapper.find("form").trigger("submit");

    expect(spy).toBeCalledTimes(1);
  });

  it("shows error message when an error is present", async () => {
    const ErrorMessageStub = {
      props: ["message"],
      template: "<div></div>",
    };
    const wrapper = shallowMount(LoginPage, {
      mocks: {
        $store,
        $router,
      },
      stubs: {
        ErrorMessage: ErrorMessageStub,
        NuxtLink: true,
      },
    });

    await wrapper.setData({
      error: "error",
    });

    expect(wrapper.findComponent(ErrorMessageStub).props("message")).toBe(
      "error"
    );
  });

  describe("userSignIn", () => {
    it("dispatches auth/requestMagicLink action", async () => {
      const wrapper = shallowMount(LoginPage, {
        mocks: {
          $store,
          $router,
        },
        stubs: {
          ErrorMessage: true,
          NuxtLink: true,
        },
      });
      const vm = wrapper.vm as VueComponent;

      await wrapper.setData({
        email: "arjun@example.com",
      });

      await vm.userSignIn();

      expect($store.dispatch).toBeCalledTimes(1);
      expect($store.dispatch).toBeCalledWith("auth/requestMagicLink", {
        email: "arjun@example.com",
      });
    });

    it("removes error message if it already exists", async () => {
      const wrapper = shallowMount(LoginPage, {
        mocks: {
          $store,
          $router,
        },
        stubs: {
          ErrorMessage: true,
          NuxtLink: true,
        },
      });
      const vm = wrapper.vm as VueComponent;

      await wrapper.setData({
        error: "error message",
      });

      await vm.userSignIn();

      expect(vm.error).toBe("");
    });

    it("sets linkSent to true", async () => {
      const wrapper = shallowMount(LoginPage, {
        mocks: {
          $store,
          $router,
        },
        stubs: {
          ErrorMessage: true,
          NuxtLink: true,
        },
      });
      const vm = wrapper.vm as VueComponent;

      expect(vm.linkSent).toBe(false);

      await vm.userSignIn();

      expect(vm.linkSent).toBe(true);
      expect(wrapper.find("form").exists()).toBeFalsy();
      expect(wrapper.find("div").text()).toContain(
        "Check your email on this device for a sign in link."
      );
    });

    it("sets error message when log in fails", async () => {
      const wrapper = shallowMount(LoginPage, {
        mocks: {
          $store,
          $router,
        },
        stubs: {
          ErrorMessage: true,
          NuxtLink: true,
        },
      });
      const vm = wrapper.vm as VueComponent;

      $store.dispatch.mockRejectedValue(new Error("some validation error"));

      await vm.userSignIn();

      expect($router.push).not.toBeCalled();
      expect(vm.error).toBe("some validation error");
    });
  });
});
