import type { MutationTree } from "vuex";

export const state = () => ({
  value: "",
});

export type QueryState = ReturnType<typeof state>;

export const mutations: MutationTree<QueryState> = {
  change: (state, newQuery: string) => (state.value = newQuery),
};
