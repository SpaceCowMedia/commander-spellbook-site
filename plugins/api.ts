import Vue from "vue";
import { Plugin } from "@nuxt/types";

type FetchOptions = Parameters<typeof fetch>[1];
declare module "vue/types/vue" {
  interface Vue {
    $api(
      path: string,
      fetchOptions: FetchOptions
    ): Promise<Record<string, unknown>>;
  }
}

const apiSetup: Plugin = (nuxt): void => {
  const { env, $fire } = nuxt;
  const baseUrl = env.apiBaseUrl;

  Vue.prototype.$api = async function (
    path: string,
    fetchOptions: FetchOptions = {}
  ) {
    let status: number;
    const user = $fire.auth.currentUser;

    if (!user) {
      return Promise.reject(
        new Error("User not logged in. Refreshng your browser and try again.")
      );
    }

    const token = await user.getIdToken();
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      ...fetchOptions,
    };

    if (options.body) {
      options.body = JSON.stringify(options.body);
    }

    return fetch(`${baseUrl}${path}`, options)
      .then((res) => {
        status = res.status;

        return res.json();
      })
      .then((res) => {
        if (status >= 400) {
          return Promise.reject(new Error(res.message));
        }

        return res;
      });
  };
};

export default apiSetup;
