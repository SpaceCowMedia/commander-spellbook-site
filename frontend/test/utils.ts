import { Firebase, Route, Router, Store } from "./types";

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

export function createFirebase(): Firebase {
  return {
    auth: {
      currentUser: {
        email: "rashmi@example.com",
        displayName: "Rashmi, Eternities Crafter",
        getIdToken: jest.fn().mockResolvedValue("token"),
        getIdTokenResult: jest.fn().mockResolvedValue({
          claims: {
            proposeCombo: true,
          },
        }),
      },
    },
    firestore: {
      getDoc: jest.fn().mockResolvedValue({}),
    },
  };
}
