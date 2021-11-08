import type { Request, Response, NextFunction } from "express";

type CreateRequestOptions = {
  headers?: Record<string, unknown>;
};

type CreateResponseOptions = {
  statusSpy?: jest.SpyInstance;
  jsonSpy?: jest.SpyInstance;
};

type CreateAdminOptions = {
  claimsSpy?: jest.SpyInstance;
  updateUserSpy?: jest.SpyInstance;
  verifyIdTokenSpy?: jest.SpyInstance;
};

export function createRequest(options: CreateRequestOptions = {}): Request {
  const { headers } = options;

  return {
    headers: headers || {
      authorization: "auth",
    },
  } as Request;
}

export function createResponse(options: CreateResponseOptions = {}): Response {
  const { statusSpy, jsonSpy } = options;

  return {
    status: (statusSpy || jest.fn()).mockReturnValue({
      json: jsonSpy || jest.fn(),
    }),
    send: jest.fn(),
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
