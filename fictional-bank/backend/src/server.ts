import dotenv from "dotenv";
dotenv.config();

import { createApp } from "./app";
import { logger } from "./config/logger";

const app = createApp();
const PORT = Number(process.env.PORT) || 4000;

// Silence favicon and apple-touch-icon 404 noise in production logs
app.get("/favicon.ico", (req, res) => res.status(204).end());
app.get("/apple-touch-icon.png", (req, res) => res.status(204).end());
app.get("/apple-touch-icon-precomposed.png", (req, res) => res.status(204).end());

app.listen(PORT, "0.0.0.0", () => {
  logger.info(`First Bank (FICTIONAL) API listening on port ${PORT}`);
});
