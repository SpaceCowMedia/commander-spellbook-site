import { shallowMount } from "@vue/test-utils";
import Pagination from "@/components/search/Pagination.vue";

describe("Pagination", () => {
  let options;

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

  test("shows simple message when results are less than page size", () => {
    options.propsData.totalPages = 1;
    options.propsData.totalResults = 9;

    const wrapper = shallowMount(Pagination, options);

    expect(wrapper.find(".back-button").classes("invisible")).toBe(true);
    expect(wrapper.find(".forward-button").classes("invisible")).toBe(true);
    expect(wrapper.find(".complex-result-message").exists()).toBe(false);
    expect(
      wrapper.find(".simple-result-message").element.textContent
    ).toContain("9 results");
  });

  test("shows simple message when results are equal to the page size", () => {
    options.propsData.totalPages = 1;
    options.propsData.totalResults = 10;

    const wrapper = shallowMount(Pagination, options);

    expect(wrapper.find(".back-button").classes("invisible")).toBe(true);
    expect(wrapper.find(".forward-button").classes("invisible")).toBe(true);
    expect(wrapper.find(".complex-result-message").exists()).toBe(false);
    expect(
      wrapper.find(".simple-result-message").element.textContent
    ).toContain("10 results");
  });

  test("shows complex message when results are larger than the page size", () => {
    const wrapper = shallowMount(Pagination, options);

    expect(wrapper.find(".simple-result-message").exists()).toBe(false);
    expect(
      wrapper
        .find(".complex-result-message")
        .element.textContent.split("\n")
        .map((v) => v.trim())
        .join(" ")
    ).toContain("Showing 1 - 10 of 23 results");
  });

  test("shows complex message with info about the current page", () => {
    options.propsData.currentPage = 2;
    const wrapper = shallowMount(Pagination, options);

    expect(
      wrapper
        .find(".complex-result-message")
        .element.textContent.split("\n")
        .map((v) => v.trim())
        .join(" ")
    ).toContain("Showing 11 - 20 of 23 results");
  });

  test("shows complex message with correct last result on last page", () => {
    options.propsData.currentPage = 3;
    const wrapper = shallowMount(Pagination, options);

    expect(
      wrapper
        .find(".complex-result-message")
        .element.textContent.split("\n")
        .map((v) => v.trim())
        .join(" ")
    ).toContain("Showing 21 - 23 of 23 results");
  });

  test("does not show the back button on the first page", () => {
    options.propsData.currentPage = 1;
    const wrapper = shallowMount(Pagination, options);

    expect(wrapper.find(".back-button").classes("invisible")).toBe(true);
  });

  test("does show the back button when not on the first page", () => {
    options.propsData.currentPage = 2;
    const wrapper = shallowMount(Pagination, options);

    expect(wrapper.find(".back-button").classes("invisible")).toBe(false);
  });

  test("calls goBack when back button is clicked", () => {
    const spy = jest.spyOn(Pagination.options.methods, "goBack");
    options.propsData.currentPage = 2;
    const wrapper = shallowMount(Pagination, options);

    wrapper.find(".back-button").trigger("click");

    expect(spy).toBeCalledTimes(1);
  });

  test("does not show the forward button on the last page", () => {
    options.propsData.currentPage = 3;
    const wrapper = shallowMount(Pagination, options);

    expect(wrapper.find(".forward-button").classes("invisible")).toBe(true);
  });

  test("does show the forward button when not on the last page", () => {
    options.propsData.currentPage = 2;
    const wrapper = shallowMount(Pagination, options);

    expect(wrapper.find(".forward-button").classes("invisible")).toBe(false);
  });

  test("calls goForward when forward button is clicked", () => {
    const spy = jest.spyOn(Pagination.options.methods, "goForward");
    options.propsData.currentPage = 2;
    const wrapper = shallowMount(Pagination, options);

    wrapper.find(".forward-button").trigger("click");

    expect(spy).toBeCalledTimes(1);
  });

  describe("goBack", () => {
    it("emits the go-back event", () => {
      const wrapper = shallowMount(Pagination, options);

      jest.spyOn(wrapper.vm, "$emit");

      wrapper.vm.goBack();
      expect(wrapper.vm.$emit).toBeCalledTimes(1);
      expect(wrapper.vm.$emit).toBeCalledWith("go-back");
    });
  });

  describe("goForward", () => {
    it("emits the go-forward event", () => {
      const wrapper = shallowMount(Pagination, options);

      jest.spyOn(wrapper.vm, "$emit");

      wrapper.vm.goForward();
      expect(wrapper.vm.$emit).toBeCalledTimes(1);
      expect(wrapper.vm.$emit).toBeCalledWith("go-forward");
    });
  });
});
