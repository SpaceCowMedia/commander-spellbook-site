import FirebaseTest from "firebase-functions-test";
import admin from "firebase-admin";
import { mocked } from "ts-jest/utils";
import { onUserCreate } from "../../src/db-hooks/users";
import generateRandomName from "../../src/lib/generate-random-name";

jest.mock("../../src/lib/generate-random-name");

const test = FirebaseTest();
const wrapped = test.wrap(onUserCreate);

jest.mock("firebase-admin");
describe("user hooks", () => {
  let claimsSpy: jest.SpyInstance;
  let updateSpy: jest.SpyInstance;

  beforeEach(() => {
    claimsSpy = jest.fn();
    updateSpy = jest.fn();
    admin.auth = jest.fn().mockReturnValue({
      setCustomUserClaims: claimsSpy,
      updateUser: updateSpy,
    });
  });

  describe("onCreate", () => {
    it("sets user claims to only allow proposing a new combo and mark as provisioned", async () => {
      await wrapped({
        uid: "user-id",
      });

      expect(claimsSpy).toBeCalledTimes(1);
      expect(claimsSpy).toBeCalledWith("user-id", {
        provisioned: true,
        proposeCombo: true,
      });
    });

    it("sets a default display name if non are provided", async () => {
      mocked(generateRandomName).mockReturnValue("Adjective Creature");

      await wrapped({
        uid: "user-id",
      });

      expect(updateSpy).toBeCalledTimes(1);
      expect(updateSpy).toBeCalledWith("user-id", {
        displayName: "Adjective Creature",
      });
    });
  });
});
