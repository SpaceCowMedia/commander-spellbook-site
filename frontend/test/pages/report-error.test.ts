import { mount } from "@vue/test-utils";
import type { MountOptions, Route } from "@/test/types";
import ReportError from "@/pages/report-error.vue";

describe("Report Error Page", () => {
  let $route: Route;
  let wrapperOptions: MountOptions;

  beforeEach(() => {
    $route = {
      query: {},
    };
    wrapperOptions = {
      mocks: {
        $route,
      },
    };
  });

  it("does not print link when comboId query param is not provided", async () => {
    const wrapper = mount(ReportError, wrapperOptions);

    // need to wait for mounted hook to fire
    await Promise.resolve();

    expect(wrapper.find("#error-template code").text()).not.toContain(
      "https://commanderspellbook.com"
    );
  });

  it("prints combo link when provided", async () => {
    $route.query.comboId = "123";
    const wrapper = mount(ReportError, wrapperOptions);

    // need to wait for mounted hook to fire
    await Promise.resolve();

    expect(wrapper.find("#error-template code").text()).toContain(
      "https://commanderspellbook.com/combo/123"
    );
  });

  it("does not print combo link when multiple combo id params are provided", async () => {
    // @ts-ignore
    $route.query.comboId = ["123", "4567"];
    const wrapper = mount(ReportError, wrapperOptions);

    // need to wait for mounted hook to fire
    await Promise.resolve();

    expect(wrapper.find("#error-template code").text()).not.toContain(
      "https://commanderspellbook.com/"
    );
  });
});
