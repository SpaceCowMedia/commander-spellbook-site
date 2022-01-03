import { shallowMount } from "@vue/test-utils";

import { createStore } from "../../utils";
import type { Store, VueComponent } from "../../types";
import AccountSettings from "@/pages/dashboard/account-settings.vue";

describe("AccountSettings", () => {
  let $store: Store;

  beforeEach(() => {
    $store = createStore({
      getters: {
        "auth/user": {
          displayName: "First Last",
          email: "first@example.com",
        },
      },
    });
  });

  it("sets default user details from store", () => {
    const wrapper = shallowMount(AccountSettings, {
      mocks: {
        $store,
      },
      stubs: {
        ProfileInput: true,
      },
    });
    const vm = wrapper.vm as VueComponent;

    expect(vm.displayName).toBe("First Last");
    expect(vm.email).toBe("first@example.com");
  });

  describe("updateProfile", () => {
    it("updates the profile", async () => {
      const wrapper = shallowMount(AccountSettings, {
        mocks: {
          $store,
        },
        stubs: {
          ProfileInput: true,
        },
      });
      const vm = wrapper.vm as VueComponent;

      await wrapper.setData({
        displayName: "New Name",
      });

      await vm.updateProfile();

      expect($store.dispatch).toBeCalledTimes(1);
      expect($store.dispatch).toBeCalledWith("auth/updateProfile", {
        displayName: "New Name",
      });
    });

    it("does not dispatch event if no fields have changed", async () => {
      const wrapper = shallowMount(AccountSettings, {
        mocks: {
          $store,
        },
        stubs: {
          ProfileInput: true,
        },
      });
      const vm = wrapper.vm as VueComponent;

      await vm.updateProfile();

      expect($store.dispatch).not.toBeCalled();
    });

    it("does not dispatch event if no field values only have white space on either side", async () => {
      const wrapper = shallowMount(AccountSettings, {
        mocks: {
          $store,
        },
        stubs: {
          ProfileInput: true,
        },
      });
      const vm = wrapper.vm as VueComponent;

      await wrapper.setData({
        displayName: "    First Last    ",
      });

      await vm.updateProfile();

      expect($store.dispatch).not.toBeCalled();
    });
  });
});
