import normalizeDatabaseValue from "@/lib/api/normalize-database-value";

describe("normalizeDatabaseValue", () => {
  it("removes \r characters", () => {
    const result = normalizeDatabaseValue("Value\r\n Foo\r Bar");

    expect(result).toBe("Value Foo Bar");
  });

  it("trims trailing space, but preserves inner space", () => {
    const result = normalizeDatabaseValue("   Value   Foo   ");

    expect(result).toBe("Value   Foo");
  });
});
