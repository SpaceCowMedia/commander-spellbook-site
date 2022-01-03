import admin from "firebase-admin";
import { https } from "firebase-functions";
// I don't know why, but the order of apiApp's
// import errors on CI, but not locally.
// If I correct it for CI, it errors locally.
// is the only solution to ignore it entirely?
// Setting it to the correct location for CI,
// so removing the disable comment should
// make it fail locally and pass on CI
// eslint-disable-next-line import/order
import apiApp from "./api";

admin.initializeApp();

export const api = https.onRequest(apiApp);
