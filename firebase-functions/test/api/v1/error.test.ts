import { PermissionError, UnknownError } from "../../../src/api/error";

describe("API Errors", () => {
  let errorClasses: Array<typeof PermissionError | typeof UnknownError>;

  beforeEach(() => {
    errorClasses = [PermissionError, UnknownError];
  });

  describe("ApiError", () => {
    it("takes a string message", () => {
      errorClasses.forEach((CustomErrorClass) => {
        const err = new CustomErrorClass("message");

        expect(err.message).toBe("message");
      });
    });

    it("takes an Error as a param", () => {
      errorClasses.forEach((CustomErrorClass) => {
        const err = new CustomErrorClass(new Error("message"));

        expect(err.message).toBe("message");
      });
    });
  });

  describe("PermissionError", () => {
    it("signifies a permission error", () => {
      const err = new PermissionError("message");

      expect(JSON.parse(JSON.stringify(err))).toEqual({
        name: "PermissionError",
        message: "message",
      });
    });

    it("defaults message to 'You do not have permission to perform this action.'", () => {
      const err = new PermissionError();

      expect(err.message).toBe(
        "You do not have permission to perform this action."
      );
    });
  });

  describe("UnknownError", () => {
    it("signifies an unknown error", () => {
      const err = new UnknownError("message");

      expect(JSON.parse(JSON.stringify(err))).toEqual({
        name: "UnknownError",
        message: "message",
      });
    });

    it("defaults message to 'Something went wrong.'", () => {
      const err = new UnknownError();

      expect(err.message).toBe("Something went wrong.");
    });
  });
});
