import type { mount, shallowMount } from "@vue/test-utils";

export type MountOptions = Parameters<typeof mount>[1];
export type Route = {
  path?: string;
  query: Record<string, string>;
};
export type Router = {
  push: jest.SpyInstance;
};
export type VueComponent = Record<string, any>;
