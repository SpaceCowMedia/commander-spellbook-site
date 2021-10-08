import { shallowMount } from "@vue/test-utils";
import flushPromises from "flush-promises";
import ProfilePage from "@/pages/profile.vue";
import { createFirebase } from "../utils";

import type { Firebase } from "../types";

describe("ProfilePage", () => {
  let $fire: Firebase;

  beforeEach(() => {
    $fire = createFirebase();
  });

  it("sets user details to current user", async () => {
    $fire.auth.currentUser!.email = "codie@example.com";
    $fire.auth.currentUser!.displayName = "Codie";

    const wrapper = shallowMount(ProfilePage, {
      mocks: {
        $fire,
      },
      stubs: {
        NuxtLink: true,
        ArtCircle: true,
      },
    });

    await flushPromises();

    expect(wrapper.find("#email").text()).toContain("codie@example.com");
    expect(wrapper.find("#display-name").text()).toContain("Codie");
    expect(wrapper.findAll("#permissions li").at(0).text()).toContain(
      "Propose New Combos"
    );
  });

  it("does not include permissions section if user has no permissions", async () => {
    $fire.auth.currentUser?.getIdTokenResult.mockResolvedValue({
      claims: {},
    });

    const wrapper = shallowMount(ProfilePage, {
      mocks: {
        $fire,
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
    delete $fire.auth.currentUser;
    const $router = {
      push: jest.fn(),
    };

    shallowMount(ProfilePage, {
      mocks: {
        $fire,
        $router,
      },
      stubs: {
        NuxtLink: true,
        ArtCircle: true,
      },
    });

    await flushPromises();

    expect($router.push).toBeCalledTimes(1);
    expect($router.push).toBeCalledWith("/signout");
  });
});
