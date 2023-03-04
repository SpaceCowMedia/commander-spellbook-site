import { shallowMount } from "@vue/test-utils";

import { createStore } from "@/test/utils";
import type {
  MountOptions,
  Route,
  Router,
  Store,
  VueComponent,
} from "@/test/types";
import HomePage from "@/pages/index.vue";

describe("HomePage", () => {
  let $route: Route;
  let $router: Router;
  let $store: Store;
  let wrapperOptions: MountOptions;

  beforeEach(() => {
    $route = {
      query: {},
    };
    $router = {
      push: jest.fn(),
    };
    $store = createStore();
    wrapperOptions = {
      mocks: {
        $route,
        $router,
        $store,
      },
      stubs: {
        SearchBar: true,
        SpellbookLogo: true,
        NuxtLink: true,
      },
    };
  });

  it("does not render a featured combos button by default", async () => {
    const wrapper = shallowMount(HomePage, wrapperOptions);

    expect(wrapper.find("#featured-combos-button").exists()).toBe(false);

    await wrapper.setData({
      featuredComboButtonText: "Button Text",
    });

    expect(wrapper.find("#featured-combos-button").exists()).toBe(true);
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

  describe("asyncData", () => {
    it("returns empty featured button text when lookup fails", async () => {
      const wrapper = shallowMount(HomePage, wrapperOptions);
      const vm = wrapper.vm as VueComponent;

      const data = await vm.$options.asyncData({
        env: {
          EDITOR_BACKEND_URL: "https://example.com/",
        },
        $http: {
          $get: jest.fn().mockRejectedValue(new Error("fail")),
        },
      });

      expect(data).toEqual({
        featuredComboButtonText: "",
      });
    });

    it("returns mocked featured button text when backend url is not available", async () => {
      const wrapper = shallowMount(HomePage, wrapperOptions);
      const vm = wrapper.vm as VueComponent;

      const data = await vm.$options.asyncData({
        env: {},
        $http: {
          $get: jest.fn().mockResolvedValue({
            results: [{ key: "featured_combos_title", value: "value" }],
          }),
        },
      });

      expect(data).toEqual({
        featuredComboButtonText: "Featured Combos (Mocked Data)",
      });
    });

    it("returns empty featured button text when lookup returns no button text", async () => {
      const wrapper = shallowMount(HomePage, wrapperOptions);
      const vm = wrapper.vm as VueComponent;

      const data = await vm.$options.asyncData({
        env: {
          EDITOR_BACKEND_URL: "https://example.com/",
        },
        $http: {
          $get: jest.fn().mockResolvedValue({
            results: [{ key: "featured_combos_title", value: "" }],
          }),
        },
      });

      expect(data).toEqual({
        featuredComboButtonText: "",
      });
    });

    it("returns button text when button text is available", async () => {
      const wrapper = shallowMount(HomePage, wrapperOptions);
      const vm = wrapper.vm as VueComponent;

      const data = await vm.$options.asyncData({
        env: {
          EDITOR_BACKEND_URL: "https://example.com/",
        },
        $http: {
          $get: jest.fn().mockResolvedValue({
            results: [{ key: "featured_combos_title", value: "Button Text" }],
          }),
        },
      });

      expect(data).toEqual({
        featuredComboButtonText: "Button Text",
      });
    });
  });
});
