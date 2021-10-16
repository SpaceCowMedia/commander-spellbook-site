import { shallowMount } from "@vue/test-utils";
import flushPromises from "flush-promises";
import ProfilePage from "@/pages/profile.vue";
import { createFirebase, createStore } from "../utils";

import type { Firebase, Store } from "../types";

describe("ProfilePage", () => {
  let $fire: Firebase;
  let $store: Store;

  beforeEach(() => {
    $fire = createFirebase();
    $store = createStore();
  });

  it("sets user details to current user", async () => {
    $fire.auth.currentUser!.email = "codie@example.com";
    $fire.auth.currentUser!.displayName = "Codie";
    $store.dispatch.mockResolvedValue({
      proposeCombo: true,
    });

    const wrapper = shallowMount(ProfilePage, {
      mocks: {
        $fire,
        $store,
      },
      stubs: {
        NuxtLink: true,
        ArtCircle: true,
      },
    });

    await flushPromises();

    expect($store.dispatch).toBeCalledTimes(1);
    expect($store.dispatch).toBeCalledWith("auth/lookupPermissions");

    expect(wrapper.find("#email").text()).toContain("codie@example.com");
    expect(wrapper.find("#display-name").text()).toContain("Codie");
    expect(wrapper.findAll("#permissions li").at(0).text()).toContain(
      "Propose New Combos"
    );
  });

  it("does not include permissions section if user has no permissions", async () => {
    $store.dispatch.mockResolvedValue({
      proposeCombo: false,
    });

    const wrapper = shallowMount(ProfilePage, {
      mocks: {
        $fire,
        $store,
      },
      stubs: {
        NuxtLink: true,
        ArtCircle: true,
      },
    });

    await flushPromises();

    expect(wrapper.find("#permissions").exists()).toBe(false);
  });

  it("redirects to /signout if user is not present", async () => {
    $store.dispatch.mockResolvedValue({});
    delete $fire.auth.currentUser;
    const $router = {
      push: jest.fn(),
    };

    shallowMount(ProfilePage, {
      mocks: {
        $fire,
        $store,
        $router,
      },
      stubs: {
        NuxtLink: true,
        ArtCircle: true,
      },
    });

    await flushPromises();

    expect($router.push).toBeCalledTimes(1);
    expect($router.push).toBeCalledWith("/signout/");
  });
});
