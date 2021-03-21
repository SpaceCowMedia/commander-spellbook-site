import SpellbookList from "@/lib/api/models/list";

describe("SpellbookList", () => {
  it("has array methods", () => {
    expect.assertions(7);

    const list = SpellbookList.create();

    list.push("a", "b", "c");

    expect(list.length).toBe(3);
    expect(list[0]).toBe("a");
    expect(list[1]).toBe("b");
    expect(list[2]).toBe("c");
    list.forEach((item, index) => {
      expect(item).toBe(list[index]);
    });
  });

  describe("create", () => {
    it("makes a new list from the string, splitting on .", () => {
      const list = SpellbookList.create("Step 1. Step 2. Step 3.");

      expect(list.length).toBe(3);
      expect(list[0]).toBe("Step 1");
      expect(list[1]).toBe("Step 2");
      expect(list[2]).toBe("Step 3");
    });
  });

  describe("includesValue", () => {
    it("returns true if any item matches", () => {
      const list = SpellbookList.create("Step 1. Step 2. Step 3.");

      expect(list.includesValue("1")).toBe(true);
      expect(list.includesValue("4")).toBe(false);
    });

    it("ignores casing", () => {
      const list = SpellbookList.create("Step 1. Step 2. Step 3.");

      expect(list.includesValue("stEp")).toBe(true);
    });
  });

  describe("includesValueExactly", () => {
    it("returns true if any item matches exactly", () => {
      const list = SpellbookList.create("Step 1. Step 2. Step 3.");

      expect(list.includesValueExactly("Step 1")).toBe(true);
      expect(list.includesValueExactly("Step")).toBe(false);
    });

    it("ignores casing", () => {
      const list = SpellbookList.create("Step 1. Step 2. Step 3.");

      expect(list.includesValueExactly("stEp 3")).toBe(true);
    });
  });

  describe("toString", () => {
    it("renders as the raw string passed in", () => {
      const list = SpellbookList.create("Step 1. Step 2. Step 3.");

      expect(list.toString()).toBe("Step 1. Step 2. Step 3.");
      expect(`pre: ${list} - post`).toBe("pre: Step 1. Step 2. Step 3. - post");
    });
  });
});
