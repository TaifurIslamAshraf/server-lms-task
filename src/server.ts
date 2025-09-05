import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import config from "./app/config/config";
import { consoleLogger, errorLogger, logger } from "./app/utils/logger";

process.on("uncaughtException", (error) => {
  consoleLogger.error(
    "😴 `Uncaught exception` happened, exiting the process and  closing the server.",
    error
  );

  process.exit(1);
});

let server: Server;

const bootstrap = async () => {
  try {
    //mongodb connection
    await mongoose.connect(config.database.mongoUri);
    consoleLogger.info(`===${config.app.env}===`);
    logger.info(`👌 Database is connected successfully.`);

    //redis connection
    // await redisClient.connect();
    logger.info("Redis connected successfull");

    server = app.listen(config.app.port, () => {
      logger.info(
        `😍 The server is running on http://localhost:${config.app.port}`
      );
    });
  } catch (error) {
    errorLogger.error(`❌ Can't connect to Database.`, error);
  }
};

process.on("unhandledRejection", (error) => {
  errorLogger.error(
    `😴 Unhandled rejection happened. Exiting the process.`,
    error
  );

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});

bootstrap();
