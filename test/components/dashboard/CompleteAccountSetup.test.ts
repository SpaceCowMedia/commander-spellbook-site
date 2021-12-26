import { shallowMount } from "@vue/test-utils";
import flushPromises from "flush-promises";
import CompleteAccountSetup from "@/components/dashboard/CompleteAccountSetup.vue";
import { createStore } from "../../utils";

import type { VueComponent, Store } from "../../types";

describe("DashboardCompleteAccountSetup", () => {
  let $store: Store;
  let $api: jest.SpyInstance;

  beforeEach(() => {
    $store = createStore({
      getters: {
        "auth/user": {
          provisioned: false,
        },
      },
    });
    $api = jest.fn().mockResolvedValue({});
  });

  it("does not load when user is already provisioned", async () => {
    $store.getters["auth/user"].provisioned = true;

    const wrapper = shallowMount(CompleteAccountSetup, {
      mocks: {
        $store,
      },
    });
    const vm = wrapper.vm as VueComponent;

    await flushPromises();

    expect($store.dispatch).toBeCalledTimes(1);
    expect($store.dispatch).toBeCalledWith("auth/lookupPermissions");
    expect(vm.loaded).toBe(false);
    expect(wrapper.find(".spinner").exists()).toBe(true);
    expect(wrapper.find("#complete-account-setup").exists()).toBe(false);
  });

  it("loads complete account setup form when display name is not present in local storage", async () => {
    const spy = jest.spyOn(
      (CompleteAccountSetup as VueComponent).options.methods,
      "provision"
    );

    const wrapper = shallowMount(CompleteAccountSetup, {
      mocks: {
        $store,
      },
    });
    const vm = wrapper.vm as VueComponent;

    await flushPromises();

    expect(vm.loaded).toBe(true);
    expect(wrapper.find(".spinner").exists()).toBe(false);
    expect(wrapper.find("#complete-account-setup").exists()).toBe(true);
    expect(spy).not.toBeCalled();
  });

  it("attempts to provision account when display name is saved in local storage", async () => {
    const spy = jest
      .spyOn(
        (CompleteAccountSetup as VueComponent).options.methods,
        "provision"
      )
      .mockImplementation();

    window.localStorage.setItem("displayNameForSignUp", "My Name");
    const wrapper = shallowMount(CompleteAccountSetup, {
      mocks: {
        $store,
      },
    });
    const vm = wrapper.vm as VueComponent;

    await flushPromises();

    expect(vm.loaded).toBe(true);
    expect(vm.username).toBe("My Name");
    expect(wrapper.find(".spinner").exists()).toBe(false);
    expect(wrapper.find("#complete-account-setup").exists()).toBe(true);
    expect(spy).toBeCalledTimes(1);
    expect(window.localStorage.getItem("displayNameForSignUp")).toBeFalsy();
  });

  describe("onSubmit", () => {
    beforeEach(() => {
      jest
        .spyOn(
          (CompleteAccountSetup as VueComponent).options.methods,
          "provision"
        )
        .mockImplementation();
    });

    it("clears any errors", () => {
      const wrapper = shallowMount(CompleteAccountSetup, {
        mocks: {
          $store,
        },
      });
      const vm = wrapper.vm as VueComponent;

      wrapper.setData({
        error: "some error",
      });

      vm.onSubmit();

      expect(vm.error).toBe("");
    });

    it("provisions", () => {
      const wrapper = shallowMount(CompleteAccountSetup, {
        mocks: {
          $store,
        },
      });
      const vm = wrapper.vm as VueComponent;

      vm.onSubmit();

      expect(
        (CompleteAccountSetup as VueComponent).options.methods.provision
      ).toBeCalledTimes(1);
    });
  });

  describe("provision", () => {
    it("sets error when username is empty", async () => {
      const wrapper = shallowMount(CompleteAccountSetup, {
        mocks: {
          $store,
          $api,
        },
      });
      const vm = wrapper.vm as VueComponent;

      wrapper.setData({
        username: "",
      });

      await vm.provision();

      expect(vm.error).toBe("Username must not be empty.");

      wrapper.setData({
        username: "      ",
        error: "",
      });

      await vm.provision();

      expect(vm.error).toBe("Username must not be empty.");
      expect($api).not.toBeCalled();
    });

    it("calls api to provision", async () => {
      const wrapper = shallowMount(CompleteAccountSetup, {
        mocks: {
          $store,
          $api,
        },
      });
      const vm = wrapper.vm as VueComponent;

      wrapper.setData({
        username: "My Username",
      });

      await vm.provision();

      expect($api).toBeCalledTimes(1);
      expect($api).toBeCalledWith("/user/provision", {
        method: "post",
        body: { username: "My Username" },
      });
    });

    it("refreshes permissions on completion", async () => {
      const wrapper = shallowMount(CompleteAccountSetup, {
        mocks: {
          $store,
          $api,
        },
      });
      const vm = wrapper.vm as VueComponent;

      wrapper.setData({
        username: "My Username",
      });

      await vm.provision();

      expect($store.dispatch).toBeCalledTimes(1);
      expect($store.dispatch).toBeCalledWith("auth/lookupPermissions");
    });

    it("does not refresh permissions if there is an error", () => {
      // TODO
    });
  });
});
