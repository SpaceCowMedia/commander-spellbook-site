import { shallowMount } from "@vue/test-utils";
import type { MountOptions, VueComponent } from "../../types";
import SearchPagination from "@/components/search/SearchPagination.vue";

describe("SearchPagination", () => {
  let options: MountOptions;

  beforeEach(() => {
    options = {
      propsData: {
        currentPage: 1,
        totalPages: 3,
      },
    };
  });

  it("does not show the back button on the first page", () => {
    // @ts-ignore
    options.propsData.currentPage = 1;
    const wrapper = shallowMount(SearchPagination, options);

    expect(wrapper.find(".back-button").classes("invisible")).toBe(true);
  });

  it("does show the back button when not on the first page", () => {
    // @ts-ignore
    options.propsData.currentPage = 2;
    const wrapper = shallowMount(SearchPagination, options);

    expect(wrapper.find(".back-button").classes("invisible")).toBe(false);
  });

  it("calls goBack when back button is clicked", () => {
    // @ts-ignore
    const spy = jest.spyOn(SearchPagination.options.methods, "goBack");
    // @ts-ignore
    options.propsData.currentPage = 2;
    const wrapper = shallowMount(SearchPagination, options);

    wrapper.find(".back-button").trigger("click");

    expect(spy).toBeCalledTimes(1);
  });

  it("does not show the forward button on the last page", () => {
    // @ts-ignore
    options.propsData.currentPage = 3;
    const wrapper = shallowMount(SearchPagination, options);

    expect(wrapper.find(".forward-button").classes("invisible")).toBe(true);
  });

  it("does show the forward button when not on the last page", () => {
    // @ts-ignore
    options.propsData.currentPage = 2;
    const wrapper = shallowMount(SearchPagination, options);

    expect(wrapper.find(".forward-button").classes("invisible")).toBe(false);
  });

  it("calls goForward when forward button is clicked", () => {
    const spy = jest.spyOn(
      (SearchPagination as VueComponent).options.methods,
      "goForward"
    );
    // @ts-ignore
    options.propsData.currentPage = 2;
    const wrapper = shallowMount(SearchPagination, options);

    wrapper.find(".forward-button").trigger("click");

    expect(spy).toBeCalledTimes(1);
  });

  describe("goBack", () => {
    it("emits the go-back event", () => {
      const wrapper = shallowMount(SearchPagination, options);

      jest.spyOn(wrapper.vm, "$emit");

      (wrapper.vm as VueComponent).goBack();
      expect(wrapper.vm.$emit).toBeCalledTimes(1);
      expect(wrapper.vm.$emit).toBeCalledWith("go-back");
    });
  });

  describe("goForward", () => {
    it("emits the go-forward event", () => {
      const wrapper = shallowMount(SearchPagination, options);

      jest.spyOn(wrapper.vm, "$emit");

      (wrapper.vm as VueComponent).goForward();
      expect(wrapper.vm.$emit).toBeCalledTimes(1);
      expect(wrapper.vm.$emit).toBeCalledWith("go-forward");
    });
  });
});
