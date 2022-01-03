import { shallowMount } from "@vue/test-utils";
import type { MountOptions } from "../../types";
import SearchMessage from "@/components/search/SearchMessage.vue";

describe("SearchMessage", () => {
  let options: MountOptions;

  beforeEach(() => {
    options = {
      propsData: {
        message: "23 combos where such and such",
        errors: "",
        maxNumberOfCombosPerPage: 10,
        currentPage: 1,
        totalPages: 3,
        totalResults: 23,
      },
    };
  });

  it("hides message when not present", async () => {
    const wrapper = shallowMount(SearchMessage, options);

    expect(wrapper.find(".search-description").exists()).toBe(true);

    await wrapper.setProps({
      message: "",
    });

    expect(wrapper.find(".search-description").exists()).toBe(false);
  });

  it("shows simple message when results are less than page size", () => {
    // @ts-ignore
    options.propsData.totalPages = 1;
    // @ts-ignore
    options.propsData.totalResults = 9;
    // @ts-ignore
    options.propsData.message = "9 combos where such and such";

    const wrapper = shallowMount(SearchMessage, options);

    expect(wrapper.find(".search-description").element.textContent).toContain(
      "9 combos where such and such"
    );
    expect(
      wrapper.find(".search-description").element.textContent
    ).not.toContain("1-9 of 9 combos");
  });

  it("shows simple message when results are equal to the page size", () => {
    // @ts-ignore
    options.propsData.totalPages = 1;
    // @ts-ignore
    options.propsData.totalResults = 10;
    // @ts-ignore
    options.propsData.message = "10 combos where such and such";

    const wrapper = shallowMount(SearchMessage, options);

    expect(wrapper.find(".search-description").element.textContent).toContain(
      "10 combos where such and such"
    );
    expect(
      wrapper.find(".search-description").element.textContent
    ).not.toContain("1-10 of 10 combos");
  });

  it("shows complex message when results are larger than the page size", () => {
    const wrapper = shallowMount(SearchMessage, options);

    expect(wrapper.find(".search-description").element.textContent).toContain(
      "1-10 of 23 combos"
    );
  });

  it("shows complex message with info about the current page", () => {
    // @ts-ignore
    options.propsData.currentPage = 2;
    const wrapper = shallowMount(SearchMessage, options);

    expect(wrapper.find(".search-description").element.textContent).toContain(
      "11-20 of 23 combos"
    );
  });

  it("shows complex message with correct last result on last page", () => {
    // @ts-ignore
    options.propsData.currentPage = 3;
    const wrapper = shallowMount(SearchMessage, options);

    expect(wrapper.find(".search-description").element.textContent).toContain(
      "21-23 of 23 combos"
    );
  });

  it("shows errors when present", async () => {
    // @ts-ignore
    options.propsData.currentPage = 3;
    const wrapper = shallowMount(SearchMessage, options);

    expect(wrapper.find(".search-errors").exists()).toBe(false);

    await wrapper.setProps({
      errors: "some error",
    });

    expect(wrapper.find(".search-errors").element.textContent).toContain(
      "some error"
    );
  });
});
