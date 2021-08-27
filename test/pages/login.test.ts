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

  it("shows error message when an error is visible", async () => {
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

    expect(wrapper.findComponent(ErrorMessageStub).exists()).toBe(false);

    await wrapper.setData({
      error: "error",
    });

    expect(wrapper.findComponent(ErrorMessageStub).props("message")).toBe(
      "error"
    );
  });

  describe("userSignIn", () => {
    it("dispatches auth/signInWithEmail action", async () => {
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
        password: "strong password",
      });

      await vm.userSignIn();

      expect($store.dispatch).toBeCalledTimes(1);
      expect($store.dispatch).toBeCalledWith("auth/signInWithEmail", {
        email: "arjun@example.com",
        password: "strong password",
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

    it("re-routes to profile page when succesfull log in", async () => {
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

      await vm.userSignIn();

      expect($router.push).toBeCalledTimes(1);
      expect($router.push).toBeCalledWith("/profile/");
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
