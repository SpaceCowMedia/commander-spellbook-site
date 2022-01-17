import { shallowMount } from "@vue/test-utils";
import type { VueComponent } from "../../types";
import AutocompleteInput from "@/components/advanced-search/AutocompleteInput.vue";

describe("AutocompleteInput", () => {
  it("creates an input", () => {
    const wrapper = shallowMount(AutocompleteInput, {
      propsData: {
        inputId: "id",
        value: "foo",
        label: "Label",
        placeholder: "placeholder",
      },
    });

    const input = wrapper.find("input").element as HTMLInputElement;
    expect(input.value).toBe("foo");
    expect(input.placeholder).toBe("placeholder");
    expect(input.id).toBe("id");

    const label = wrapper.find("label");
    expect(label.text()).toBe("Label");
    expect(label.attributes("for")).toBe("id");
  });

  it("applies border classes for error", async () => {
    const wrapper = shallowMount(AutocompleteInput, {
      propsData: {
        hasError: false,
      },
    });

    expect(wrapper.find("input").classes()).not.toContain("border-danger");

    await wrapper.setProps({ hasError: true });

    expect(wrapper.find("input").classes()).toContain("border-danger");
  });

  it("applies input class if specified", () => {
    const wrapper = shallowMount(AutocompleteInput, {
      propsData: {
        inputClass: "custom-input-class",
      },
    });

    expect(wrapper.find("input").classes()).toContain("custom-input-class");
  });

  it("shows autocomplete results when there any matching autocomplete results", async () => {
    const TextWithMagicSymbolStub = {
      template: "<div></div>",
      props: ["text"],
    };
    const wrapper = shallowMount(AutocompleteInput, {
      propsData: {
        autocompleteOptions: [
          { value: "1", label: "Label 1" },
          { value: "2", label: "Label 2" },
          { value: "3", label: "Label 3" },
        ],
      },
      stubs: {
        TextWithMagicSymbol: TextWithMagicSymbolStub,
      },
    });

    expect(wrapper.find(".autocomplete-results").isVisible()).toBeFalsy();

    await wrapper.setData({
      matchingAutocompleteOptions: [
        { value: "1", label: "Label 1" },
        { value: "3", label: "Label 3" },
      ],
    });

    expect(wrapper.find(".autocomplete-results").isVisible()).toBeTruthy();

    expect(wrapper.findAll(".autocomplete-results li").length).toBe(2);
    const items = wrapper.findAllComponents(TextWithMagicSymbolStub);
    expect(items.length).toBe(2);
    expect(items.at(0).props("text")).toBe("Label 1");
    expect(items.at(1).props("text")).toBe("Label 3");
  });

  it("updates screen reader message when autocomplete options are browsed", async () => {
    const options = [
      { value: "1", label: "Label 1" },
      { value: "2", label: "Label 2" },
      { value: "3", label: "Label 3" },
    ];
    const wrapper = shallowMount(AutocompleteInput, {
      propsData: {
        autocompleteOptions: options,
      },
    });

    await wrapper.setData({
      matchingAutocompleteOptions: options,
    });

    const message = wrapper.find(".autocomplete-sr-message");

    expect(message.text()).toBe("");

    await wrapper.setProps({
      value: "foo",
    });

    expect(message.text()).toContain("3 matches found for foo.");

    await wrapper.setData({
      arrowCounter: 0,
    });

    expect(message.text()).toContain("Label 1 (1/3)");

    await wrapper.setData({
      arrowCounter: 1,
    });

    expect(message.text()).toContain("Label 2 (2/3)");

    await wrapper.setData({
      arrowCounter: -1,
      matchingAutocompleteOptions: [{ value: "foo", label: "foo" }],
    });

    expect(message.text()).toContain("1 match found for foo.");
  });

  it("marks item as active when the arrow counter matches it", async () => {
    const options = [
      { value: "1", label: "Label 1" },
      { value: "2", label: "Label 2" },
      { value: "3", label: "Label 3" },
    ];
    const wrapper = shallowMount(AutocompleteInput, {
      propsData: {
        autocompleteOptions: options,
      },
    });

    await wrapper.setData({
      matchingAutocompleteOptions: options,
    });

    const items = wrapper.findAll(".autocomplete-results li");
    expect(items.length).toBe(3);

    expect(items.at(0).classes()).not.toContain("is-active");
    expect(items.at(1).classes()).not.toContain("is-active");
    expect(items.at(2).classes()).not.toContain("is-active");

    await wrapper.setData({
      arrowCounter: 1,
    });

    expect(items.at(0).classes()).not.toContain("is-active");
    expect(items.at(1).classes()).toContain("is-active");
    expect(items.at(2).classes()).not.toContain("is-active");
  });

  it("calls onClick with item when clicked", async () => {
    const onClickSpy = jest.spyOn(
      (AutocompleteInput as VueComponent).options.methods,
      "onClick"
    );
    const options = [
      { value: "1", label: "Label 1" },
      { value: "2", label: "Label 2" },
      { value: "3", label: "Label 3" },
    ];
    const wrapper = shallowMount(AutocompleteInput, {
      propsData: {
        autocompleteOptions: options,
      },
    });

    await wrapper.setData({
      matchingAutocompleteOptions: options,
    });

    const items = wrapper.findAll(".autocomplete-results li");

    await items.at(1).trigger("click");

    expect(onClickSpy).toBeCalledTimes(1);
    expect(onClickSpy).toBeCalledWith({
      value: "2",
      label: "Label 2",
    });
  });

  it("sets arrow counter when autocomplete item is hovered over", async () => {
    const onAutocompleteItemHoverSpy = jest.spyOn(
      (AutocompleteInput as VueComponent).options.methods,
      "onAutocompleteItemHover"
    );
    const options = [
      { value: "1", label: "Label 1" },
      { value: "2", label: "Label 2" },
      { value: "3", label: "Label 3" },
    ];
    const wrapper = shallowMount(AutocompleteInput, {
      propsData: {
        autocompleteOptions: options,
      },
    });

    await wrapper.setData({
      matchingAutocompleteOptions: options,
    });

    const items = wrapper.findAll(".autocomplete-results li");

    await items.at(1).trigger("mouseover");

    expect(onAutocompleteItemHoverSpy).toBeCalledTimes(1);
    expect(onAutocompleteItemHoverSpy).toBeCalledWith(1);
  });

  it.each`
    method           | event
    ${"onChange"}    | ${"input"}
    ${"onBlur"}      | ${"blur"}
    ${"onArrowDown"} | ${"keydown.down"}
    ${"onArrowUp"}   | ${"keydown.up"}
    ${"onEnter"}     | ${"keydown.enter"}
    ${"onTab"}       | ${"keydown.tab"}
    ${"close"}       | ${"keydown.escape"}
  `(
    "calls $method when an $event event fires on the input",
    async ({ method, event }) => {
      const options = [
        { value: "1", label: "Label 1" },
        { value: "2", label: "Label 2" },
        { value: "3", label: "Label 3" },
      ];
      const methodSpy = jest.spyOn(
        (AutocompleteInput as VueComponent).options.methods,
        method
      );
      const wrapper = shallowMount(AutocompleteInput, {
        propsData: {
          autocompleteOptions: options,
        },
      });

      await wrapper.find("input").trigger(event);

      expect(methodSpy).toBeCalledTimes(1);
    }
  );

  describe("onChange", () => {
    it("noops if no autocomplete options are provided", () => {
      const lookupAutocompleteSpy = jest.spyOn(
        (AutocompleteInput as VueComponent).options.methods,
        "lookupAutocomplete"
      );
      const wrapper = shallowMount(AutocompleteInput);

      (wrapper.vm as VueComponent).onChange();

      expect(lookupAutocompleteSpy).not.toBeCalled();
    });

    it("calls lookupAutocomplete if autocomplete options are avaialable", () => {
      const options = [
        { value: "1", label: "Label 1" },
        { value: "2", label: "Label 2" },
        { value: "3", label: "Label 3" },
      ];
      const lookupAutocompleteSpy = jest.spyOn(
        (AutocompleteInput as VueComponent).options.methods,
        "lookupAutocomplete"
      );
      const wrapper = shallowMount(AutocompleteInput, {
        propsData: {
          autocompleteOptions: options,
        },
      });

      (wrapper.vm as VueComponent).onChange();

      expect(lookupAutocompleteSpy).toBeCalledTimes(1);
    });
  });

  describe("onAutocompleteItemHover", () => {
    it("sets arrow counter to index", () => {
      const wrapper = shallowMount(AutocompleteInput);
      const vm = wrapper.vm as VueComponent;

      vm.onAutocompleteItemHover(3);

      expect(vm.arrowCounter).toBe(3);
    });
  });

  describe("onBlur", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    it("noops if no autocomplete options are provided", () => {
      const closeSpy = jest.spyOn(
        (AutocompleteInput as VueComponent).options.methods,
        "close"
      );
      const wrapper = shallowMount(AutocompleteInput);

      (wrapper.vm as VueComponent).onBlur();

      jest.runAllTimers();

      expect(closeSpy).not.toBeCalled();
    });

    it("calls close after a short timeout if autocomplete options are avaialable", () => {
      const options = [
        { value: "1", label: "Label 1" },
        { value: "2", label: "Label 2" },
        { value: "3", label: "Label 3" },
      ];
      const closeSpy = jest.spyOn(
        (AutocompleteInput as VueComponent).options.methods,
        "close"
      );
      const wrapper = shallowMount(AutocompleteInput, {
        propsData: {
          autocompleteOptions: options,
        },
      });

      (wrapper.vm as VueComponent).onBlur();

      expect(closeSpy).not.toBeCalled();

      jest.advanceTimersByTime(999);

      expect(closeSpy).not.toBeCalled();

      jest.advanceTimersByTime(2);

      expect(closeSpy).toBeCalledTimes(1);
    });
  });

  describe("choose", () => {
    it("closes the autocomplete menu", () => {
      const closeSpy = jest.spyOn(
        (AutocompleteInput as VueComponent).options.methods,
        "close"
      );
      const wrapper = shallowMount(AutocompleteInput);

      (wrapper.vm as VueComponent).choose({
        value: "foo",
        label: "Foo",
      });

      expect(closeSpy).toBeCalledTimes(1);
    });

    it("emits the label from the autocomplete option", () => {
      const emitSpy = jest.fn();
      const wrapper = shallowMount(AutocompleteInput, {
        mocks: {
          $emit: emitSpy,
        },
      });

      (wrapper.vm as VueComponent).choose({
        value: "foo",
        label: "Foo",
      });

      expect(emitSpy).toBeCalledTimes(1);
      expect(emitSpy).toBeCalledWith("input", "Foo");
    });

    it("emits the value from the autocomplete option when configured", () => {
      const emitSpy = jest.fn();
      const wrapper = shallowMount(AutocompleteInput, {
        propsData: {
          useValueForInput: true,
        },
        mocks: {
          $emit: emitSpy,
        },
      });

      (wrapper.vm as VueComponent).choose({
        value: "foo",
        label: "Foo",
      });

      expect(emitSpy).toBeCalledTimes(1);
      expect(emitSpy).toBeCalledWith("input", "foo");
    });
  });

  describe("close", () => {
    it("resets scrollTop position of autocomplete results", () => {
      const wrapper = shallowMount(AutocompleteInput);
      const vm = wrapper.vm as VueComponent;
      const autocompleteRef = vm.$refs.autocompleteResults;

      autocompleteRef.scrollTop = 456;

      vm.close();

      expect(autocompleteRef.scrollTop).toBe(0);
    });

    it("resets arrowCounter to -1", () => {
      const wrapper = shallowMount(AutocompleteInput);
      const vm = wrapper.vm as VueComponent;

      wrapper.setData({
        arrowCounter: 4,
      });

      vm.close();

      expect(vm.arrowCounter).toBe(-1);
    });

    it("resets matchingAutocompleteOptions to empty array", () => {
      const wrapper = shallowMount(AutocompleteInput);
      const vm = wrapper.vm as VueComponent;

      wrapper.setData({
        matchingAutocompleteOptions: [{ value: "foo", label: "Foo" }],
      });

      vm.close();

      expect(vm.matchingAutocompleteOptions).toEqual([]);
    });
  });

  describe("onArrowDown", () => {
    it("prevents normal keyboard behavior", () => {
      const spy = jest.fn();
      const wrapper = shallowMount(AutocompleteInput);
      const vm = wrapper.vm as VueComponent;

      vm.onArrowDown({
        preventDefault: spy,
      });

      expect(spy).toBeCalledTimes(1);
    });

    it("increments arrow counter as long as increment is not greater than the number of matching autocomplete options", () => {
      const event = { preventDefault: jest.fn() };
      const wrapper = shallowMount(AutocompleteInput);
      const vm = wrapper.vm as VueComponent;

      wrapper.setData({
        matchingAutocompleteOptions: [
          { value: "1", label: "1" },
          { value: "2", label: "2" },
        ],
      });

      expect(vm.arrowCounter).toBe(-1);

      vm.onArrowDown(event);
      expect(vm.arrowCounter).toBe(0);

      vm.onArrowDown(event);
      expect(vm.arrowCounter).toBe(1);

      vm.onArrowDown(event);
      vm.onArrowDown(event);
      vm.onArrowDown(event);
      vm.onArrowDown(event);
      expect(vm.arrowCounter).toBe(1);
    });

    it("scrolls to selection", () => {
      const scrollSpy = jest.spyOn(
        (AutocompleteInput as VueComponent).options.methods,
        "scrollToSelection"
      );
      const wrapper = shallowMount(AutocompleteInput);
      const vm = wrapper.vm as VueComponent;

      vm.onArrowDown({
        preventDefault: jest.fn(),
      });

      expect(scrollSpy).toBeCalledTimes(1);
    });
  });

  describe("onArrowUp", () => {
    it("prevents normal keyboard behavior", () => {
      const spy = jest.fn();
      const wrapper = shallowMount(AutocompleteInput);
      const vm = wrapper.vm as VueComponent;

      vm.onArrowUp({
        preventDefault: spy,
      });

      expect(spy).toBeCalledTimes(1);
    });

    it("decrements arrow counter as long as arrow counter is greater than or equal to 0", () => {
      const event = { preventDefault: jest.fn() };
      const wrapper = shallowMount(AutocompleteInput);
      const vm = wrapper.vm as VueComponent;

      wrapper.setData({
        arrowCounter: 2,
      });

      expect(vm.arrowCounter).toBe(2);

      vm.onArrowUp(event);
      expect(vm.arrowCounter).toBe(1);

      vm.onArrowUp(event);
      expect(vm.arrowCounter).toBe(0);

      vm.onArrowUp(event);
      vm.onArrowUp(event);
      vm.onArrowUp(event);
      vm.onArrowUp(event);
      expect(vm.arrowCounter).toBe(-1);
    });

    it("scrolls to selection", () => {
      const scrollSpy = jest.spyOn(
        (AutocompleteInput as VueComponent).options.methods,
        "scrollToSelection"
      );
      const wrapper = shallowMount(AutocompleteInput);
      const vm = wrapper.vm as VueComponent;

      vm.onArrowUp({
        preventDefault: jest.fn(),
      });

      expect(scrollSpy).toBeCalledTimes(1);
    });
  });

  describe("scrollToSelection", () => {
    it("noops if there are no li elements", async () => {
      const wrapper = shallowMount(AutocompleteInput);
      const vm = wrapper.vm as VueComponent;
      const autocompleteRef = vm.$refs.autocompleteResults;

      await wrapper.setData({
        arrowCounter: 1,
      });

      vm.scrollToSelection();

      expect(autocompleteRef.scrollTop).toBe(0);
    });

    it("sets autocomplete result element's scrollTop to around the location of the item", async () => {
      const wrapper = shallowMount(AutocompleteInput);
      const vm = wrapper.vm as VueComponent;
      const autocompleteRef = vm.$refs.autocompleteResults;

      await wrapper.setData({
        arrowCounter: 4,
        matchingAutocompleteOptions: [
          {
            value: "1",
            label: "1",
          },
          {
            value: "2",
            label: "2",
          },
          {
            value: "3",
            label: "3",
          },
          {
            value: "4",
            label: "4",
          },
          {
            value: "5",
            label: "5",
          },
          {
            value: "6",
            label: "6",
          },
          {
            value: "7",
            label: "7",
          },
        ],
      });

      // set the offset for the li that will be scrolled to
      // have to do it this way because _tecnically_ ths is
      // a readonly property
      Object.defineProperties(autocompleteRef.querySelectorAll("li")[4], {
        offsetTop: {
          get() {
            return 70;
          },
        },
      });

      vm.scrollToSelection();

      expect(autocompleteRef.scrollTop).toBe(20);
    });
  });

  describe("onEnter", () => {
    it("noops if no autocomplete option correspondes to the current arrow counter", async () => {
      const chooseSpy = jest.spyOn(
        (AutocompleteInput as VueComponent).options.methods,
        "choose"
      );
      const eventSpy = jest.fn();
      const wrapper = shallowMount(AutocompleteInput);
      const vm = wrapper.vm as VueComponent;

      await wrapper.setData({
        arrowCounter: 4,
        matchingAutocompleteOptions: [
          {
            value: "1",
            label: "1",
          },
          {
            value: "2",
            label: "2",
          },
        ],
      });

      vm.onEnter({ preventDefault: eventSpy });

      expect(eventSpy).not.toBeCalled();
      expect(chooseSpy).not.toBeCalled();
    });

    it("chooses the selected autocomplete choice", async () => {
      const chooseSpy = jest.spyOn(
        (AutocompleteInput as VueComponent).options.methods,
        "choose"
      );
      const eventSpy = jest.fn();
      const wrapper = shallowMount(AutocompleteInput);
      const vm = wrapper.vm as VueComponent;

      await wrapper.setData({
        arrowCounter: 1,
        matchingAutocompleteOptions: [
          {
            value: "1",
            label: "1",
          },
          {
            value: "2",
            label: "2",
          },
        ],
      });

      vm.onEnter({ preventDefault: eventSpy });

      expect(eventSpy).toBeCalledTimes(1);
      expect(chooseSpy).toBeCalledTimes(1);
      expect(chooseSpy).toBeCalledWith({
        value: "2",
        label: "2",
      });
    });
  });

  describe("onTab", () => {
    it("noops if no autocomplete option correspondes to the current arrow counter", async () => {
      const chooseSpy = jest.spyOn(
        (AutocompleteInput as VueComponent).options.methods,
        "choose"
      );
      const wrapper = shallowMount(AutocompleteInput);
      const vm = wrapper.vm as VueComponent;

      await wrapper.setData({
        arrowCounter: 4,
        matchingAutocompleteOptions: [
          {
            value: "1",
            label: "1",
          },
          {
            value: "2",
            label: "2",
          },
        ],
      });

      vm.onTab();

      expect(chooseSpy).not.toBeCalled();
    });

    it("chooses the selected autocomplete choice", async () => {
      const chooseSpy = jest.spyOn(
        (AutocompleteInput as VueComponent).options.methods,
        "choose"
      );
      const wrapper = shallowMount(AutocompleteInput);
      const vm = wrapper.vm as VueComponent;

      await wrapper.setData({
        arrowCounter: 1,
        matchingAutocompleteOptions: [
          {
            value: "1",
            label: "1",
          },
          {
            value: "2",
            label: "2",
          },
        ],
      });

      vm.onTab();

      expect(chooseSpy).toBeCalledTimes(1);
      expect(chooseSpy).toBeCalledWith({
        value: "2",
        label: "2",
      });
    });
  });

  describe("onClick", () => {
    it("chooses the selected autocomplete choice", () => {
      const chooseSpy = jest.spyOn(
        (AutocompleteInput as VueComponent).options.methods,
        "choose"
      );
      const wrapper = shallowMount(AutocompleteInput);
      const vm = wrapper.vm as VueComponent;

      vm.onClick({
        value: "2",
        label: "2",
      });

      expect(chooseSpy).toBeCalledTimes(1);
      expect(chooseSpy).toBeCalledWith({
        value: "2",
        label: "2",
      });
    });

    it("focuses back on input", () => {
      const wrapper = shallowMount(AutocompleteInput);
      const vm = wrapper.vm as VueComponent;
      const input = wrapper.find("input").element as HTMLInputElement;
      const focusSpy = jest.spyOn(input, "focus");

      vm.onClick({
        value: "2",
        label: "2",
      });

      expect(focusSpy).toBeCalledTimes(1);
    });
  });

  describe("findAllMatches", () => {
    it("filters for values that contain the value of the input", () => {
      const wrapper = shallowMount(AutocompleteInput, {
        propsData: {
          autocompleteOptions: [
            { value: "1", label: "1" },
            { value: "afoo", label: "A Foo" },
            { value: "bfoo", label: "B Foo" },
            { value: "4", label: "4" },
          ],
        },
      });
      const vm = wrapper.vm as VueComponent;

      const matches = vm.findAllMatches("foo");

      expect(matches).toEqual([
        { value: "afoo", label: "A Foo" },
        { value: "bfoo", label: "B Foo" },
      ]);
    });

    it("supports aliases to match if present in the option", () => {
      const wrapper = shallowMount(AutocompleteInput, {
        propsData: {
          value: "some value baz some other value",
          autocompleteOptions: [
            { value: "1", label: "1" },
            { value: "afoo", label: "A Foo" },
            { value: "bfoo", label: "B Foo", alias: /baz/ },
            { value: "4", label: "4" },
          ],
        },
      });
      const vm = wrapper.vm as VueComponent;

      const matches = vm.findAllMatches("some value baz some other value");

      expect(matches).toEqual([
        { value: "bfoo", label: "B Foo", alias: /baz/ },
      ]);
    });
  });

  describe("findBestMatches", () => {
    it("sorts results", () => {
      const wrapper = shallowMount(AutocompleteInput);
      const vm = wrapper.vm as VueComponent;

      const matches = vm.findBestMatches(
        [
          { value: "123foo", label: "1" },
          { value: "afoo", label: "A Foo" },
          { value: "bfoo", label: "B Foo" },
          { value: "foo4", label: "4" },
        ],
        "foo"
      );

      expect(matches).toEqual([
        { value: "foo4", label: "4" },
        { value: "afoo", label: "A Foo" },
        { value: "bfoo", label: "B Foo" },
        { value: "123foo", label: "1" },
      ]);
    });

    it("shows a max of 20 autocomplete results", () => {
      const options = [];
      let index = 0;
      while (index < 30) {
        options.push({
          value: `foo-${index + 1}`,
          label: `Label ${index + 1}`,
        });
        index++;
      }

      const wrapper = shallowMount(AutocompleteInput);
      const vm = wrapper.vm as VueComponent;

      const matches = vm.findBestMatches(options, "foo");

      expect(matches).toEqual([
        { value: "foo-1", label: "Label 1" },
        { value: "foo-2", label: "Label 2" },
        { value: "foo-3", label: "Label 3" },
        { value: "foo-4", label: "Label 4" },
        { value: "foo-5", label: "Label 5" },
        { value: "foo-6", label: "Label 6" },
        { value: "foo-7", label: "Label 7" },
        { value: "foo-8", label: "Label 8" },
        { value: "foo-9", label: "Label 9" },
        { value: "foo-10", label: "Label 10" },
        { value: "foo-11", label: "Label 11" },
        { value: "foo-12", label: "Label 12" },
        { value: "foo-13", label: "Label 13" },
        { value: "foo-14", label: "Label 14" },
        { value: "foo-15", label: "Label 15" },
        { value: "foo-16", label: "Label 16" },
        { value: "foo-17", label: "Label 17" },
        { value: "foo-18", label: "Label 18" },
        { value: "foo-19", label: "Label 19" },
        { value: "foo-20", label: "Label 20" },
      ]);
    });
  });

  describe("createAutocompleteTimeout", () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.runAllTimers();
    });

    it("returns an setTimeout reference", () => {
      const wrapper = shallowMount(AutocompleteInput, {
        propsData: {
          value: "foo",
          autocompleteOptions: [{ value: "1", lable: "1" }],
        },
      });
      const vm = wrapper.vm as VueComponent;

      const ref = vm.createAutocompleteTimeout();

      expect(ref).toBeGreaterThanOrEqual(0);

      jest.runAllTimers();
    });

    it("closes if the autocomplete starts with a value but ends up without a value when the filtering is applied", async () => {
      const closeSpy = jest.spyOn(
        (AutocompleteInput as VueComponent).options.methods,
        "close"
      );
      const wrapper = shallowMount(AutocompleteInput, {
        propsData: {
          value: "foo",
          autocompleteOptions: [{ value: "1", lable: "1" }],
        },
      });
      const vm = wrapper.vm as VueComponent;

      vm.createAutocompleteTimeout();

      expect(closeSpy).not.toBeCalled();

      jest.advanceTimersByTime(100);

      expect(closeSpy).not.toBeCalled();

      await wrapper.setProps({
        value: "",
      });

      jest.advanceTimersByTime(51);

      expect(closeSpy).toBeCalledTimes(1);
      expect(vm.matchingAutocompleteOptions).toEqual([]);
    });

    it("finds matches", () => {
      const wrapper = shallowMount(AutocompleteInput, {
        propsData: {
          value: "Foo",
          autocompleteOptions: [
            { value: "1", label: "1" },
            { value: "afoo", label: "A Foo" },
            { value: "bfoo", label: "B Foo" },
            { value: "4", label: "4" },
          ],
        },
      });
      const vm = wrapper.vm as VueComponent;

      jest.spyOn(vm, "findAllMatches").mockReturnValue([
        { value: "afoo", label: "A Foo" },
        { value: "bfoo", label: "B Foo" },
      ]);
      jest.spyOn(vm, "findBestMatches").mockReturnValue([
        { value: "bfoo", label: "B Foo" },
        { value: "afoo", label: "A Foo" },
      ]);

      vm.lookupAutocomplete();

      jest.advanceTimersByTime(151);
      expect(vm.matchingAutocompleteOptions).toEqual([
        { value: "bfoo", label: "B Foo" },
        { value: "afoo", label: "A Foo" },
      ]);

      expect(vm.findAllMatches).toBeCalledTimes(1);
      expect(vm.findAllMatches).toBeCalledWith("foo");
      expect(vm.findBestMatches).toBeCalledTimes(1);
      expect(vm.findBestMatches).toBeCalledWith(
        [
          { value: "afoo", label: "A Foo" },
          { value: "bfoo", label: "B Foo" },
        ],
        "foo"
      );
    });

    it("waits to find matches until after a delay", () => {
      const wrapper = shallowMount(AutocompleteInput, {
        propsData: {
          value: "Foo",
          autocompleteOptions: [
            { value: "1", label: "1" },
            { value: "afoo", label: "A Foo" },
            { value: "bfoo", label: "B Foo" },
            { value: "4", label: "4" },
          ],
        },
      });
      const vm = wrapper.vm as VueComponent;

      jest.spyOn(vm, "findAllMatches").mockReturnValue([
        { value: "afoo", label: "A Foo" },
        { value: "bfoo", label: "B Foo" },
      ]);
      jest.spyOn(vm, "findBestMatches").mockReturnValue([
        { value: "bfoo", label: "B Foo" },
        { value: "afoo", label: "A Foo" },
      ]);

      vm.lookupAutocomplete();

      expect(vm.findAllMatches).not.toBeCalled();
      expect(vm.findBestMatches).not.toBeCalled();

      jest.advanceTimersByTime(149);

      expect(vm.findAllMatches).not.toBeCalled();
      expect(vm.findBestMatches).not.toBeCalled();

      jest.advanceTimersByTime(2);

      expect(vm.findAllMatches).toBeCalledTimes(1);
      expect(vm.findBestMatches).toBeCalledTimes(1);
    });
  });

  describe("lookupAutocomplete", () => {
    it("noops if there are no autocomplete options", () => {
      const closeSpy = jest.spyOn(
        (AutocompleteInput as VueComponent).options.methods,
        "close"
      );
      const wrapper = shallowMount(AutocompleteInput, {
        propsData: {
          value: "",
        },
      });
      const vm = wrapper.vm as VueComponent;

      vm.lookupAutocomplete();

      expect(closeSpy).not.toBeCalled();
      expect(vm.matchingAutocompleteOptions).toEqual([]);
    });

    it("closes if there is no value", () => {
      const closeSpy = jest.spyOn(
        (AutocompleteInput as VueComponent).options.methods,
        "close"
      );
      const wrapper = shallowMount(AutocompleteInput, {
        propsData: {
          value: "",
          autocompleteOptions: [{ value: "1", lable: "1" }],
        },
      });
      const vm = wrapper.vm as VueComponent;

      vm.lookupAutocomplete();

      expect(closeSpy).toBeCalledTimes(1);
      expect(vm.matchingAutocompleteOptions).toEqual([]);
    });

    it("creates an autocomplete timeout", () => {
      const wrapper = shallowMount(AutocompleteInput, {
        propsData: {
          value: "foo",
          autocompleteOptions: [{ value: "1", lable: "1" }],
        },
      });
      const vm = wrapper.vm as VueComponent;

      jest.spyOn(vm, "createAutocompleteTimeout").mockImplementation();

      vm.lookupAutocomplete();

      expect(vm.createAutocompleteTimeout).toBeCalledTimes(1);
    });
  });
});
