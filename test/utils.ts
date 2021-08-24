import { Route, Store } from "./types";

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
