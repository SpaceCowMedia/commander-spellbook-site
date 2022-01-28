import { PERMISSIONS } from "../../src/shared/constants";

describe("Constants gut checks", () => {
  it("does not repeat values in Permissions constants", () => {
    const values = Object.values(PERMISSIONS);
    const uniqueValues = new Set(values);

    expect(values.length).toBe(uniqueValues.size);
  });
});
