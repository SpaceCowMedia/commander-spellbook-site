import { https } from "firebase-functions";
import admin from "firebase-admin";
import apiV1 from "./api/v1";

admin.initializeApp();

export const v1 = https.onRequest(apiV1);
