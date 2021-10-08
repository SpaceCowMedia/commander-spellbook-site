import FirebaseTest from "firebase-functions-test";
import admin from "firebase-admin";
import { onUserCreate } from "../../src/db-hooks/users";

const test = FirebaseTest();
const wrapped = test.wrap(onUserCreate);

jest.mock("firebase-admin");

describe("user hooks", () => {
  let claimsSpy: jest.SpyInstance;

  beforeEach(() => {
    claimsSpy = jest.fn();
    admin.auth = jest.fn().mockReturnValue({
      setCustomUserClaims: claimsSpy,
    });
  });

  describe("onCreate", () => {
    it("sets user claims to only allow proposing a new combo", async () => {
      await wrapped({
        uid: "user-id",
      });

      expect(claimsSpy).toBeCalledTimes(1);
      expect(claimsSpy).toBeCalledWith("user-id", {
        propose_combos: true,
      });
    });
  });
});
