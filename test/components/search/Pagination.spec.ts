import { shallowMount } from "@vue/test-utils";
import Pagination from "@/components/search/Pagination.vue";
import type { MountOptions, VueComponent } from "../../types";

describe("Pagination", () => {
  let options: MountOptions;

  beforeEach(() => {
    options = {
      propsData: {
        pageSize: 10,
        currentPage: 1,
        totalPages: 3,
        totalResults: 23,
      },
    };
  });

  it("shows simple message when results are less than page size", () => {
    // @ts-ignore
    options.propsData.totalPages = 1;
    // @ts-ignore
    options.propsData.totalResults = 9;

    const wrapper = shallowMount(Pagination, options);

    expect(wrapper.find(".back-button").classes("invisible")).toBe(true);
    expect(wrapper.find(".forward-button").classes("invisible")).toBe(true);
    expect(wrapper.find(".complex-result-message").exists()).toBe(false);
    expect(
      wrapper.find(".simple-result-message").element.textContent
    ).toContain("9 results");
  });

  it("shows simple message when results are equal to the page size", () => {
    // @ts-ignore
    options.propsData.totalPages = 1;
    // @ts-ignore
    options.propsData.totalResults = 10;

    const wrapper = shallowMount(Pagination, options);

    expect(wrapper.find(".back-button").classes("invisible")).toBe(true);
    expect(wrapper.find(".forward-button").classes("invisible")).toBe(true);
    expect(wrapper.find(".complex-result-message").exists()).toBe(false);
    expect(
      wrapper.find(".simple-result-message").element.textContent
    ).toContain("10 results");
  });

  it("shows complex message when results are larger than the page size", () => {
    const wrapper = shallowMount(Pagination, options);

    expect(wrapper.find(".simple-result-message").exists()).toBe(false);
    const element = wrapper.find(".complex-result-message")
      .element as HTMLDivElement;
    const textContent = element.textContent as string;
    expect(
      textContent
        .split("\n")
        .map((v) => v.trim())
        .join(" ")
    ).toContain("Showing 1 - 10 of 23 results");
  });

  it("shows complex message with info about the current page", () => {
    // @ts-ignore
    options.propsData.currentPage = 2;
    const wrapper = shallowMount(Pagination, options);
    const element = wrapper.find(".complex-result-message").element;
    const textContent = element.textContent as string;

    expect(
      textContent
        .split("\n")
        .map((v) => v.trim())
        .join(" ")
    ).toContain("Showing 11 - 20 of 23 results");
  });

  it("shows complex message with correct last result on last page", () => {
    // @ts-ignore
    options.propsData.currentPage = 3;
    const wrapper = shallowMount(Pagination, options);

    const element = wrapper.find(".complex-result-message").element;
    const textContent = element.textContent as string;
    expect(
      textContent
        .split("\n")
        .map((v) => v.trim())
        .join(" ")
    ).toContain("Showing 21 - 23 of 23 results");
  });

  it("does not show the back button on the first page", () => {
    // @ts-ignore
    options.propsData.currentPage = 1;
    const wrapper = shallowMount(Pagination, options);

    expect(wrapper.find(".back-button").classes("invisible")).toBe(true);
  });

  it("does show the back button when not on the first page", () => {
    // @ts-ignore
    options.propsData.currentPage = 2;
    const wrapper = shallowMount(Pagination, options);

    expect(wrapper.find(".back-button").classes("invisible")).toBe(false);
  });

  it("calls goBack when back button is clicked", () => {
    // @ts-ignore
    const spy = jest.spyOn(Pagination.options.methods, "goBack");
    // @ts-ignore
    options.propsData.currentPage = 2;
    const wrapper = shallowMount(Pagination, options);

    wrapper.find(".back-button").trigger("click");

    expect(spy).toBeCalledTimes(1);
  });

  it("does not show the forward button on the last page", () => {
    // @ts-ignore
    options.propsData.currentPage = 3;
    const wrapper = shallowMount(Pagination, options);

    expect(wrapper.find(".forward-button").classes("invisible")).toBe(true);
  });

  it("does show the forward button when not on the last page", () => {
    // @ts-ignore
    options.propsData.currentPage = 2;
    const wrapper = shallowMount(Pagination, options);

    expect(wrapper.find(".forward-button").classes("invisible")).toBe(false);
  });

  it("calls goForward when forward button is clicked", () => {
    const spy = jest.spyOn(
      (Pagination as VueComponent).options.methods,
      "goForward"
    );
    // @ts-ignore
    options.propsData.currentPage = 2;
    const wrapper = shallowMount(Pagination, options);

    wrapper.find(".forward-button").trigger("click");

    expect(spy).toBeCalledTimes(1);
  });

  describe("goBack", () => {
    it("emits the go-back event", () => {
      const wrapper = shallowMount(Pagination, options);

      jest.spyOn(wrapper.vm, "$emit");

      (wrapper.vm as VueComponent).goBack();
      expect(wrapper.vm.$emit).toBeCalledTimes(1);
      expect(wrapper.vm.$emit).toBeCalledWith("go-back");
    });
  });

  describe("goForward", () => {
    it("emits the go-forward event", () => {
      const wrapper = shallowMount(Pagination, options);

      jest.spyOn(wrapper.vm, "$emit");

      (wrapper.vm as VueComponent).goForward();
      expect(wrapper.vm.$emit).toBeCalledTimes(1);
      expect(wrapper.vm.$emit).toBeCalledWith("go-forward");
    });
  });
});
