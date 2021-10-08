import { https } from "firebase-functions";
import admin from "firebase-admin";
import app from "./api";

admin.initializeApp();

export * as users from "./db-hooks/users";

export const api = https.onRequest(app);
