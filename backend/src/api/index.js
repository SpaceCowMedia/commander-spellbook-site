const cors = require("cors");
const bodyParser = require("body-parser");
const express = require("express");
const v1 = require("./v1");

const app = express();

app.use(cors({ origin: true }));
app.use(bodyParser.json());
app.use("/v1", v1);
app.use((_, res) => {
  res.status(404).json({
    message: "Route not found.",
  });
});

module.exports = app;
