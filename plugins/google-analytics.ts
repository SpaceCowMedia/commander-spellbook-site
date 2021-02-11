import Vue from "vue";
import type VueRouter from "vue-router";
import VueGtag from "vue-gtag";

type NuxtObject = {
  app: {
    router: VueRouter;
  };
};

export default (nuxt: NuxtObject) => {
  const gdprIsAccepted = localStorage.getItem("GDPR:accepted") === "true";
  const isProd = process.env.NODE_ENV === "production";
  const shouldRunAnalytics = isProd && gdprIsAccepted;

  Vue.use(
    VueGtag,
    {
      config: { id: "G-357BGWEVLV" },
      appName: "Commander Spellbook",
      bootstrap: shouldRunAnalytics,
      enabled: shouldRunAnalytics,
      pageTrackerScreenviewEnabled: true,
    },
    nuxt.app.router
  );
};
