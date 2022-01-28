import normalizeCardName from "@/lib/normalize-card-name";

describe("normalizeCardName", () => {
  it("lowercases", () => {
    expect(normalizeCardName("Shock")).toBe("shock");
  });

  it("removes all characters execpt for letters, numbers and spaces", () => {
    expect(normalizeCardName("Borrowing 10,000 Arrows")).toBe(
      "borrowing 10000 arrows"
    );
  });

  it("uses only the first piece of a split card", () => {
    expect(normalizeCardName("Commit // Memory")).toBe("commit");
  });
});
