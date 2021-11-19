import type { Request, Response, NextFunction } from "express";

type CreateRequestOptions = {
  headers?: Record<string, unknown>;
  userPermissions?: Record<string, boolean> | null;
};

type CreateAdminOptions = {
  claimsSpy?: jest.SpyInstance;
  updateUserSpy?: jest.SpyInstance;
  verifyIdTokenSpy?: jest.SpyInstance;
};

export function createRequest(options: CreateRequestOptions = {}): Request {
  const { headers, userPermissions } = options;

  return {
    headers: headers || {
      authorization: "auth",
    },
    userPermissions: userPermissions || {
      provisioned: true,
      proposeCombo: true,
    },
  } as Request;
}

export function createResponse(): Response {
  return {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
    json: jest.fn(),
  } as any; // not great, but the response has a billion entries and Typescript won't let us get away with just putting in a few
}

export function createNext(): NextFunction {
  return jest.fn() as NextFunction;
}

export function createAdmin(options: CreateAdminOptions = {}) {
  const { claimsSpy, updateUserSpy, verifyIdTokenSpy } = options;

  return jest.fn().mockReturnValue({
    setCustomUserClaims: claimsSpy || jest.fn(),
    updateUser: updateUserSpy || jest.fn(),
    verifyIdToken: verifyIdTokenSpy || jest.fn(),
  });
}
