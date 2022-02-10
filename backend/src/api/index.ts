import cors from "cors";
import bodyParser from "body-parser";
import express from "express";
import v1 from "./v1";

const app = express();

app.use(cors({ origin: true }));
app.use(bodyParser.json());
app.use("/v1", v1);
app.use((_, res) => {
  res.status(404).json({
    message: "Route not found.",
  });
});

export default app;
