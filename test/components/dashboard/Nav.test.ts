import { shallowMount } from "@vue/test-utils";
import flushPromises from "flush-promises";
import DashboardNav from "@/components/dashboard/Nav.vue";
import { createFirebase, createStore } from "../../utils";

import type { Firebase, Store } from "../../types";

describe("DashboardNav", () => {
  let $fire: Firebase;
  let $store: Store;

  beforeEach(() => {
    $fire = createFirebase();
    $store = createStore();
  });

  it("shows only basic nav links when user has no permissions", async () => {
    $store.dispatch.mockResolvedValue({
      proposeCombo: false,
      manageUserPermissions: false,
      viewUsers: false,
    });

    const wrapper = shallowMount(DashboardNav, {
      mocks: {
        $fire,
        $store,
      },
      stubs: {
        NuxtLink: true,
      },
    });

    await flushPromises();

    const links = wrapper.findAll("nav ul li");

    expect(links.length).toBe(2);
    expect(links.at(0).text()).toContain("Your Settings");
    expect(links.at(1).text()).toContain("Sign Out");
  });

  it("shows nav links based on user has no permissions", async () => {
    $store.dispatch.mockResolvedValue({
      proposeCombo: true,
      manageUserPermissions: true,
      viewUsers: true,
    });

    const wrapper = shallowMount(DashboardNav, {
      mocks: {
        $fire,
        $store,
      },
      stubs: {
        NuxtLink: true,
      },
    });

    await flushPromises();

    const links = wrapper.findAll("nav ul li");

    expect(links.length).toBe(4);
    expect(links.at(0).text()).toContain("Your Settings");
    expect(links.at(1).text()).toContain("Propose New Combo");
    expect(links.at(2).text()).toContain("Users");
    expect(links.at(3).text()).toContain("Sign Out");
  });

  it("redirects to /signout if user is not present", async () => {
    $store.dispatch.mockResolvedValue({});
    delete $fire.auth.currentUser;
    const $router = {
      push: jest.fn(),
    };

    shallowMount(DashboardNav, {
      mocks: {
        $fire,
        $store,
        $router,
      },
      stubs: {
        NuxtLink: true,
      },
    });

    await flushPromises();

    expect($router.push).toBeCalledTimes(1);
    expect($router.push).toBeCalledWith("/signout/");
  });
});
