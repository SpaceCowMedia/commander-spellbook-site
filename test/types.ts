import type { mount } from "@vue/test-utils";

export type MountOptions = Parameters<typeof mount>[1];
export type Route = {
  params?: Record<string, string>;
  path?: string;
  query: Record<string, string>;
};
export type Router = {
  push: jest.SpyInstance;
  replace?: jest.SpyInstance;
};
export type VueComponent = Record<string, any>;
