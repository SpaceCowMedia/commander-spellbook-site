import { PERMISSIONS } from "@/lib/constants";

describe("Permissions Constant Gut Check", () => {
  it("does not repeat values in Permissions constants", () => {
    const values = Object.values(PERMISSIONS);
    const uniqueValues = new Set(values);

    expect(values.length).toBe(uniqueValues.size);
  });
});
