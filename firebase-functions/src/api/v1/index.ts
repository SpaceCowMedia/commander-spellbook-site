import cors from "cors";
import bodyParser from "body-parser";
import express from "express";
import requireAuthentication from "./middleware/require-authentication";
import user from "./routes/user";

const app = express();

app.use(cors({ origin: true }));
app.use(bodyParser.json());
app.use(requireAuthentication);
app.use("/user", user);
app.use("*", (_, res) => {
  // TODO anything else we need to do here?
  res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

export default app;
