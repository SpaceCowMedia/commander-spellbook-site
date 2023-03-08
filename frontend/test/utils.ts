import { Route, Router, Store } from "@/test/types";

type CreateRouteOptions = {
  path?: string;
};
type CreateStoreOptions = {
  getters?: Record<string, any>;
};

export function createRoute(options: CreateRouteOptions = {}): Route {
  return {
    params: {},
    path: options.path || "/",
    query: {},
  };
}

export function createRouter(): Router {
  return {
    push: jest.fn(),
    replace: jest.fn(),
  };
}

export function createStore(options: CreateStoreOptions = {}): Store {
  return {
    state: {
      query: {
        value: "",
      },
    },
    getters: options.getters || {},
    commit: jest.fn(),
    dispatch: jest.fn().mockResolvedValue({}),
  };
}
