import { pluralize } from "@/plugins/text-helpers";

describe("helpers", () => {
  describe("pluralize", () => {
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
