import dotenv from "dotenv";
dotenv.config();

import { createApp } from "./app";
import { logger } from "./config/logger";

const app = createApp();
const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, "0.0.0.0", () => {
  logger.info(`FirstDemo Bank (FICTIONAL) API listening on port ${PORT}`);
});
