import type { Request, Response, NextFunction } from "express";

type CreateRequestOptions = {
  headers?: Record<string, unknown>;
  userPermissions?: Record<string, boolean> | null;
  body?: Record<string, unknown>;
  params?: Record<string, unknown>;
  userId?: string;
};

type CreateAdminOptions = {
  claimsSpy?: jest.SpyInstance;
  updateUserSpy?: jest.SpyInstance;
  getUserSpy?: jest.SpyInstance;
  verifyIdTokenSpy?: jest.SpyInstance;
};

export function createRequest(options: CreateRequestOptions = {}): Request {
  const { body, headers, params, userId, userPermissions } = options;

  return {
    headers: headers || {
      authorization: "Bearer auth",
    },
    body: body || {},
    params: params || {},
    userPermissions: userPermissions || {
      provisioned: true,
      proposeCombo: true,
    },
    userId: userId || "user-id",
  } as any; // not great, but the request object has a billion entries and Typescript won't let us get away with just putting in a few
}

export function createResponse(): Response {
  return {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
    json: jest.fn(),
  } as any; // same thing here with the request object
}

export function createNext(): NextFunction {
  return jest.fn() as NextFunction;
}

export function createAdminAuth(options: CreateAdminOptions = {}) {
  const { claimsSpy, getUserSpy, updateUserSpy, verifyIdTokenSpy } = options;

  return jest.fn().mockReturnValue({
    getUser: getUserSpy || jest.fn(),
    setCustomUserClaims: claimsSpy || jest.fn(),
    updateUser: updateUserSpy || jest.fn(),
    verifyIdToken: verifyIdTokenSpy || jest.fn(),
  });
}
