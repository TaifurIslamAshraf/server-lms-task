import { createClient } from "redis";
import { consoleLogger, logger } from "../utils/logger";

const redisClient = createClient({
  url: "redis://127.0.0.1:6379",
});

redisClient.on("error", (err) => {
  logger.error("Redis Client Error", err);
  consoleLogger.log(err);
});

export default redisClient;
