import { shallowMount } from "@vue/test-utils";
import flushPromises from "flush-promises";
import { createStore } from "../../utils";

import type { Store } from "../../types";
import DashboardNav from "@/components/dashboard/DashboardNav.vue";

describe("DashboardNav", () => {
  let $store: Store;

  beforeEach(() => {
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
        $store,
      },
      stubs: {
        NuxtLink: true,
      },
    });

    await flushPromises();

    const links = wrapper.findAll("nav ul li");

    expect(links.length).toBe(3);
    expect(links.at(0).text()).toContain("Recent Activity");
    expect(links.at(1).text()).toContain("Account Settings");
    expect(links.at(2).text()).toContain("Sign Out");
  });

  it("shows nav links based on user's permissions", async () => {
    $store.dispatch.mockResolvedValue({
      proposeCombo: true,
      manageUserPermissions: true,
      manageSiteContent: true,
      viewUsers: true,
    });

    const wrapper = shallowMount(DashboardNav, {
      mocks: {
        $store,
      },
      stubs: {
        NuxtLink: true,
      },
    });

    await flushPromises();

    const links = wrapper.findAll("nav ul li");

    expect(links.length).toBe(6);
    expect(links.at(0).text()).toContain("Recent Activity");
    expect(links.at(1).text()).toContain("Account Settings");
    expect(links.at(2).text()).toContain("Site Settings");
    expect(links.at(3).text()).toContain("Propose New Combo");
    expect(links.at(4).text()).toContain("Users");
    expect(links.at(5).text()).toContain("Sign Out");
  });
});
