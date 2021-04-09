import { shallowMount } from "@vue/test-utils";
import HomePage from "@/pages/index.vue";
import search from "@/lib/api/search";
import makeFakeCombo from "@/lib/api/make-fake-combo";
import { mocked } from "ts-jest/utils";

import type { MountOptions, Route, Router, VueComponent } from "../types";

jest.mock("@/lib/api/search");

describe("HomePage", () => {
  let $route: Route;
  let $router: Router;
  let wrapperOptions: MountOptions;

  beforeEach(() => {
    $route = {
      query: {},
    };
    $router = {
      push: jest.fn(),
    };
    wrapperOptions = {
      mocks: {
        $route,
        $router,
      },
      stubs: {
        SearchBar: true,
        Logo: true,
        NuxtLink: true,
      },
    };
  });

  it("remains on home page when no query is available", () => {
    shallowMount(HomePage, wrapperOptions);

    expect($router.push).not.toBeCalled();
  });

  it("remains on home page when query is not a string", () => {
    // @ts-ignore
    $route.query.q = ["foo", "bar"];
    shallowMount(HomePage, wrapperOptions);

    expect($router.push).not.toBeCalled();
  });

  it("redirects to search page when query is available", () => {
    $route.query.q = "card:Sydri";
    shallowMount(HomePage, wrapperOptions);

    expect($router.push).toBeCalledTimes(1);
    expect($router.push).toBeCalledWith("/search/?q=card:Sydri");
  });

  it("redirects to combo page when q query is a number", () => {
    $route.query.q = "435";
    shallowMount(HomePage, wrapperOptions);

    expect($router.push).toBeCalledTimes(1);
    expect($router.push).toBeCalledWith("/combo/435/");
  });

  it("redirects to combo page when id query is a number", () => {
    $route.query.id = "435";
    shallowMount(HomePage, wrapperOptions);

    expect($router.push).toBeCalledTimes(1);
    expect($router.push).toBeCalledWith("/combo/435/");
  });

  it("redirects to search results page when query is a previewed", () => {
    $route.query.q = "spoiled";
    shallowMount(HomePage, wrapperOptions);

    expect($router.push).toBeCalledTimes(1);
    expect($router.push).toBeCalledWith("/search/?q=is:previewed");
  });

  it("redirects to search results page when status param is spoiled", () => {
    $route.query.q = "card:Sydri";
    $route.query.status = "spoiled";
    shallowMount(HomePage, wrapperOptions);

    expect($router.push).toBeCalledTimes(1);
    expect($router.push).toBeCalledWith("/search/?q=is:previewed");
  });

  it("redirects to search results page when query is a banned", () => {
    $route.query.q = "banned";
    shallowMount(HomePage, wrapperOptions);

    expect($router.push).toBeCalledTimes(1);
    expect($router.push).toBeCalledWith("/search/?q=is:banned");
  });

  it("redirects to search results page when status param is a banned", () => {
    $route.query.q = "card:Sydri";
    $route.query.status = "banned";
    shallowMount(HomePage, wrapperOptions);

    expect($router.push).toBeCalledTimes(1);
    expect($router.push).toBeCalledWith("/search/?q=is:banned");
  });

  it("displays previewed combos button when there are previews", async () => {
    const wrapper = shallowMount(HomePage, wrapperOptions);

    expect(wrapper.find(".previwed-combos-button").exists()).toBe(false);

    await wrapper.setData({
      showPreviewLink: true,
    });

    expect(wrapper.find(".previwed-combos-button").exists()).toBe(true);
  });

  describe("asyncData", () => {
    beforeEach(() => {
      mocked(search).mockResolvedValue({
        sort: "colors",
        order: "ascending",
        combos: [],
        message: "",
        errors: [],
      });
    });

    it("sets showPreviewLink to true when there is at least one previwed combo", async () => {
      const wrapper = shallowMount(HomePage, wrapperOptions);
      const vm = wrapper.vm as VueComponent;

      mocked(search).mockResolvedValue({
        sort: "colors",
        order: "ascending",
        combos: [],
        message: "",
        errors: [],
      });
      const resultWithoutCombos = await vm.$options.asyncData();

      expect(resultWithoutCombos.showPreviewLink).toBe(false);

      mocked(search).mockResolvedValue({
        sort: "colors",
        order: "ascending",
        combos: [makeFakeCombo()],
        message: "",
        errors: [],
      });
      const resultWithCombos = await vm.$options.asyncData();

      expect(resultWithCombos.showPreviewLink).toBe(true);
    });
  });
});
