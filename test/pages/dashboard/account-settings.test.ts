import { shallowMount } from "@vue/test-utils";
import AccountSettings from "@/pages/dashboard/account-settings.vue";

import { createStore } from "../../utils";
import type { Store, VueComponent } from "../../types";

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
        email: "new-email@example.com",
      });

      await vm.updateProfile();

      expect($store.dispatch).toBeCalledTimes(1);
      expect($store.dispatch).toBeCalledWith("auth/updateProfile", {
        displayName: "New Name",
        email: "new-email@example.com",
      });
    });
  });
});
