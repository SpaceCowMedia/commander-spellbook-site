import { https } from "firebase-functions";
import admin from "firebase-admin";
import apiApp from "./api";

admin.initializeApp();

export const api = https.onRequest(apiApp);
