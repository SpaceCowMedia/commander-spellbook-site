import { shallowMount } from "@vue/test-utils";
import SignUpPage from "@/pages/sign-up.vue";
import { createStore } from "../utils";

import type { Store, Router, VueComponent } from "../types";

describe("SignUpPage", () => {
  let $router: Router, $store: Store;

  beforeEach(() => {
    $router = {
      push: jest.fn(),
      replace: jest.fn(),
    };
    $store = createStore();
  });

  it("calls userSignUp when form submits", () => {
    const wrapper = shallowMount(SignUpPage, {
      mocks: {
        $store,
        $router,
      },
      stubs: {
        ErrorMessage: true,
        NuxtLink: true,
      },
    });

    const spy = jest.spyOn(wrapper.vm as VueComponent, "userSignUp");

    wrapper.find("form").trigger("submit");

    expect(spy).toBeCalledTimes(1);
  });

  it("shows error message when an error is visible", async () => {
    const ErrorMessageStub = {
      props: ["message"],
      template: "<div></div>",
    };
    const wrapper = shallowMount(SignUpPage, {
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

  describe("userSignUp", () => {
    it("dispatches auth/signUp action", async () => {
      const wrapper = shallowMount(SignUpPage, {
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

      await vm.userSignUp();

      expect($store.dispatch).toBeCalledTimes(1);
      expect($store.dispatch).toBeCalledWith("auth/signUp", {
        email: "arjun@example.com",
        password: "strong password",
      });
    });

    it("removes error message if it already exists", async () => {
      const wrapper = shallowMount(SignUpPage, {
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

      await vm.userSignUp();

      expect(vm.error).toBe("");
    });

    it("re-routes to profile page when succesfull signup", async () => {
      const wrapper = shallowMount(SignUpPage, {
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

      await vm.userSignUp();

      expect($router.push).toBeCalledTimes(1);
      expect($router.push).toBeCalledWith("/profile/");
    });

    it("sets error message when signup fails", async () => {
      const wrapper = shallowMount(SignUpPage, {
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

      await vm.userSignUp();

      expect($router.push).not.toBeCalled();
      expect(vm.error).toBe("some validation error");
    });
  });
});
