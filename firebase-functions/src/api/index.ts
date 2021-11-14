import cors from "cors";
import bodyParser from "body-parser";
import express from "express";
import requireAuthentication from "./middleware/require-authentication";

const app = express();

app.use(cors({ origin: true }));
app.use(bodyParser.json());
app.use(requireAuthentication);

export default app;
