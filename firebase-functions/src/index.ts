import admin from "firebase-admin";
import apiApp from "./api";
import { https } from "firebase-functions";

admin.initializeApp();

export const api = https.onRequest(apiApp);
