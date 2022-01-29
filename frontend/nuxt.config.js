import { config as configureDotenv } from "dotenv";
import firebaseConfig from "../firebase-config";
import connectToFirebase from "./lib/connect-to-firebase";
import combos from "./static/api/combo-data.json";

configureDotenv({ path: "../.env" });

const isWindows = process.platform === "win32";

const batch = process.env.COMBO_BATCH || "";
const title = "Commander Spellbook: The Search Engine for EDH Combos";
const description =
  "The Premier Magic: the Gathering Combo Search Engine for the Commander / Elder Dragon Highlander (EDH) Format.";
const linkPreviewImage = "https://commanderspellbook.com/link-preview.png";

const isDev = process.env.NODE_ENV === "development";
const isStaging = process.env.NODE_ENV === "staging";
const useEmulators = isDev && process.env.USE_FIREBASE_EMULATORS === "true";

let apiBaseUrl = "https://api.commanderspellbook.com/v1";

// TODO staging url
if (useEmulators) {
  apiBaseUrl = "http://localhost:5000/v1";
} else if (isDev) {
  apiBaseUrl = "https://api-local.commanderspellbook.com/v1";
} else if (isStaging) {
  apiBaseUrl = "https://api-staging.commanderspellbook.com/v1";
}

export default {
  // Target (https://go.nuxtjs.dev/config-target)
  target: "static",

  env: {
    useEmulators,
    apiBaseUrl,
    FIREBASE_API_KEY: firebaseConfig.apiKey,
    FIREBASE_AUTH_DOMAIN: firebaseConfig.authDomain,
    FIREBASE_PROJECT_ID: firebaseConfig.projectId,
    FIREBASE_STORAGE_BUCKET: firebaseConfig.storageBucket,
    FIREBASE_MESSAGING_SENDER_ID: firebaseConfig.messagingSenderId,
    FIREBASE_APP_ID: firebaseConfig.appId,
  },

  // Global page headers (https://go.nuxtjs.dev/config-head)
  head: {
    title,
    htmlAttrs: {
      lang: "en",
    },
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        hid: "description",
        name: "description",
        content: description,
      },
      // Open Graph / Facebook
      {
        hid: "og-type",
        property: "og:type",
        content: "website",
      },
      {
        hid: "og-url",
        property: "og:url",
        content: "https://commanderspellbook.com/",
      },
      {
        hid: "og-title",
        property: "og:title",
        content: title,
      },
      {
        hid: "og-site_name",
        property: "og:site_name",
        content: title,
      },
      {
        hid: "og-description",
        property: "og:description",
        content: description,
      },
      {
        hid: "og-image",
        property: "og:image",
        content: linkPreviewImage,
      },
      // Twitter metatags
      {
        hid: "twitter-card",
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        hid: "twitter-url",
        name: "twitter:url",
        content: "https://commanderspellbook.com/",
      },
      {
        hid: "twitter-title",
        name: "twitter:title",
        content: title,
      },
      {
        hid: "twitter-description",
        name: "twitter:description",
        content: description,
      },
      {
        hid: "twitter-image",
        name: "twitter:image",
        content: linkPreviewImage,
      },
    ],
    link: [
      {
        rel: "icon",
        type: "image/x-icon",
        href: "/favicons/favicon.ico",
      },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/favicons/apple-touch-icon.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicons/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicons/favicon-16x16.png",
      },
      { rel: "manifest", href: "/site.webmanifest" },
      {
        rel: "search",
        type: "application/opensearchdescription+xml",
        title: "Commander Spellbook: The Search Engine for EDH Combos",
        href: "https://commanderspellbook.com/opensearch.xml",
      },
    ],
  },

  router: {
    trailingSlash: true,
    middleware: ["authenticated"],
  },

  // Global CSS (https://go.nuxtjs.dev/config-css)
  css: ["~/assets/global.css"],

  generate: {
    dir: `dist${batch ? "-" + batch : ""}`,
    fallback: "404.html",
    crawler: false,
    routes() {
      if (!batch) {
        return [];
      }

      let [start, end] = batch.split("to");
      start = Number(start);
      end = Number(end);

      return combos
        .filter((_, index) => {
          // only look at combos within the batch
          return index >= start && index <= end;
        })
        .map((combo) => ({
          route: `/combo/${combo.d}`,
          // TODO eventually we'll pass the data this way
          payload: combo,
        }));
    },
  },

  // Plugins to run before rendering page (https://go.nuxtjs.dev/config-plugins)
  plugins: [
    {
      src: "./plugins/google-analytics.ts",
      mode: "client",
    },
    "~/plugins/vue-tooltip.ts",
    "~/plugins/firebase.ts",
    {
      src: "./plugins/api.ts",
      mode: "client",
    },
    "~/plugins/text-helpers.ts",
  ],

  modulesDir: ['../node_modules'],

  // Modules for dev and build (recommended) (https://go.nuxtjs.dev/config-modules)
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    "@nuxt/typescript-build",
    // https://go.nuxtjs.dev/stylelint
    "@nuxtjs/stylelint-module",
    // https://go.nuxtjs.dev/tailwindcss
    "@nuxtjs/tailwindcss",
  ],

  // Modules (https://go.nuxtjs.dev/config-modules)
  modules: ["@nuxtjs/google-fonts", "vue-social-sharing/nuxt"],

  // Axios module configuration (https://go.nuxtjs.dev/config-axios)
  axios: {},

  // Build Configuration (https://go.nuxtjs.dev/config-build)
  build: {},

  tailwindcss: {
    jit: !isWindows,
  },
  hooks: {
    generate: {
      done() {
        const { teardownFirebase } = connectToFirebase({});
        teardownFirebase();
      },
    },
  },

  googleFonts: {
    families: {
      "Josefin+Sans": [400],
      Roboto: [400, 700],
    },
  },
};
