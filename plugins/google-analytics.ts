import Vue from "vue";
import type VueRouter from "vue-router";
import VueGtag from "vue-gtag";

type NuxtObject = {
  app: {
    router: VueRouter;
  };
};

export default (nuxt: NuxtObject) => {
  const getGDPR = localStorage.getItem("GDPR:accepted");

  Vue.use(
    VueGtag,
    {
      config: { id: "G-357BGWEVLV" },
      appName: "Commander Spellbook",
      bootstrap: getGDPR === "true",
      enabled: getGDPR === "true",
      pageTrackerScreenviewEnabled: true,
    },
    nuxt.app.router
  );
};
