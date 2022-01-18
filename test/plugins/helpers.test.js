import { pluralize } from "~/plugins/helpers";

describe("helpers", () => {
  describe("pluralize", () => {
    it("should be defined", () => {
      expect(pluralize).toBeInstanceOf(Function);
      expect(pluralize).toHaveLength(2);
    });

    it("should not require count", () => {
      expect(pluralize("catpant")).toBe("catpants");
    });

    it("should work for singular words", () => {
      expect(pluralize("catpant", 1)).toBe("catpant");
    });

    it("should work for plural words", () => {
      expect(pluralize("catpant", 42)).toBe("catpants");
    });

    it("should work for irregular words", () => {
      expect(pluralize("box", 42, "boxes")).toBe("boxes");
    });
  });
});
