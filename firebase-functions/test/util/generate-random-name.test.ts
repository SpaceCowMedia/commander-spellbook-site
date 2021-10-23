import createRandomDisplayName from "../../src/util/generate-random-name";

describe("generate random name", () => {
  it("generates a random username", () => {
    jest
      .spyOn(Math, "random")
      .mockReturnValueOnce(0.1)
      .mockReturnValueOnce(0.2);
    const name = createRandomDisplayName();

    expect(name).toBe("Duskwatch Djinn");
  });
});
