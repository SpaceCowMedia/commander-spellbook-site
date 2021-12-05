import { https } from "firebase-functions";
import admin from "firebase-admin";
import app from "./api";

admin.initializeApp();

export const api = https.onRequest(app);
