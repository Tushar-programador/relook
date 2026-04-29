import { createApp } from "./app.js";
import { connectToDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";

async function bootstrap() {
  await connectToDatabase();
  const app = createApp();

  app.listen(env.PORT, () => {
    logger.info(`API listening on port ${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  logger.error("Failed to start server", { message: error.message, stack: error.stack });
  process.exit(1);
});