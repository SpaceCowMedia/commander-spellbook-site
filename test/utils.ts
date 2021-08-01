import { Store } from "./types";

export function createStore(): Store {
  return {
    state: {
      query: {
        value: "",
      },
    },
    commit: jest.fn(),
  };
}
