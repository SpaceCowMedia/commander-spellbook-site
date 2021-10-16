import cors from "cors";
import bodyParser from "body-parser";
import express from "express";

const app = express();

app.use(cors({ origin: true }));
app.use(bodyParser.json());

export default app;
