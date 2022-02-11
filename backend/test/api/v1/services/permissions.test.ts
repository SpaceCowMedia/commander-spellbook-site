import admin from "firebase-admin";
import { createAdminAuth } from "../../../helper";
import {
  getPermissions,
  setPermissions,
  transformClaimsToPermissions,
  transformPermissionsToClaims,
  validatePermissions,
} from "../../../../src/api/v1/services/permissions";
import { ValidationError } from "../../../../src/api/error";

jest.mock("firebase-admin");

describe("permissions service", () => {
  let claimsSpy: jest.SpyInstance;
  let getUserSpy: jest.SpyInstance;

  beforeEach(() => {
    claimsSpy = jest.fn();
    getUserSpy = jest.fn();
    admin.auth = createAdminAuth({
      claimsSpy,
      getUserSpy,
    });
  });

  describe("transformClaimsToPermissions", () => {
    it("transforms claims to permissions object", () => {
      const permissions = transformClaimsToPermissions({
        p: 1,
        r: 1,
        m: 1,
      });

      expect(permissions).toEqual(
        expect.objectContaining({
          proposeCombo: true,
          provisioned: true,
          manageUsers: true,
          viewUsers: false,
        })
      );
    });
  });

  describe("transformClaimsToPermissions", () => {
    it("transforms claims to permissions object", () => {
      const claims = transformPermissionsToClaims({
        proposeCombo: true,
        provisioned: true,
        manageUsers: true,
        viewUsers: false,
      });

      expect(claims).toEqual({
        r: 1,
        p: 1,
        m: 1,
      });
    });
  });

  describe("getPermissions", () => {
    it("resolves permissions from given user id", async () => {
      getUserSpy.mockResolvedValue({ customClaims: { r: 1, p: 1, m: 1 } });

      const permissions = await getPermissions("user-id");

      expect(getUserSpy).toBeCalledTimes(1);
      expect(getUserSpy).toBeCalledWith("user-id");
      expect(permissions).toEqual(
        expect.objectContaining({
          provisioned: true,
          proposeCombo: true,
          manageUsers: true,
          manageSiteContent: false,
          viewUsers: false,
        })
      );
    });

    it("defaults all permissions to false when there are no custom claims for the user", async () => {
      getUserSpy.mockResolvedValue({});

      const permissions = await getPermissions("user-id");

      expect(permissions).toEqual(
        expect.objectContaining({
          provisioned: false,
          proposeCombo: false,
          manageUsers: false,
          manageSiteContent: false,
          viewUsers: false,
        })
      );
    });

    it("throws an error when admin.auth() throws an error", async () => {
      admin.auth = jest.fn().mockImplementation(() => {
        throw new Error("auth error");
      });

      await expect(getPermissions("user-id")).rejects.toEqual(
        new Error("auth error")
      );
    });

    it("throws an error when getUser throws an error", async () => {
      getUserSpy.mockImplementation(() => {
        throw new Error("get user error");
      });

      await expect(getPermissions("user-id")).rejects.toEqual(
        new Error("get user error")
      );
    });
  });

  describe("validatePermissions", () => {
    it("rejects with a validation error when permissions that don't exist in the Permissions schema are used", async () => {
      await expect(
        validatePermissions({
          proposeCombo: true,
          // @ts-ignore
          "eat-rocks": true,
          // @ts-ignore
          proposeRulesChanges: false,
          // @ts-ignore
          asdf: true,
          viewUsers: true,
        })
      ).rejects.toEqual(
        new ValidationError(
          "Unknown permission keys: eat-rocks, proposeRulesChanges, asdf."
        )
      );
    });

    it("rejects with a validation error when permissions values are not all booleans", async () => {
      await expect(
        validatePermissions({
          // @ts-ignore
          proposeCombo: "true",
          // @ts-ignore
          manageUsers: "false",
          viewUsers: true,
        })
      ).rejects.toEqual(
        new ValidationError(
          "Invalid values for permission keys: proposeCombo, manageUsers. Must have a value of true or false."
        )
      );
    });

    it("rejects with a validation error when no permission keys are provided", async () => {
      await expect(validatePermissions({})).rejects.toEqual(
        new ValidationError("No permissions provided.")
      );
    });

    it("rejects with a validation error when no permission object is provided", async () => {
      await expect(validatePermissions()).rejects.toEqual(
        new ValidationError("No permissions provided.")
      );
    });
  });

  describe("setPermissions", () => {
    it("sets permissions for a user, including an automatic provisioned permission", async () => {
      await setPermissions("user-id", {
        proposeCombo: true,
        manageUsers: false,
      });

      expect(claimsSpy).toBeCalledTimes(1);
      expect(claimsSpy).toBeCalledWith("user-id", {
        r: 1,
        p: 1,
      });
    });

    it("rejects with an error when setting custom claims fails", async () => {
      claimsSpy.mockRejectedValue(new Error("set claims error"));

      await expect(
        setPermissions("user-id", {
          proposeCombo: true,
          manageUsers: false,
        })
      ).rejects.toEqual(new Error("set claims error"));
    });
  });
});
