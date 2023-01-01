const admin = require("firebase-admin");
const { https } = require("firebase-functions");
const apiApp = require("./api");

admin.initializeApp();

const api = https.onRequest(apiApp);

module.exports = {
  api,
};
