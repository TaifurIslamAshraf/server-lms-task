import { Application } from "express";
import fs from "fs";
import yaml from "js-yaml";
import swaggerUi from "swagger-ui-express";
import ApiError from "../errorHandlers/ApiError";
import { logger } from "../utils/logger";

export interface ISwaggerConfig {
  name: string;
  route: string;
  yamlFilePath: string;
}

export const setupSwagger = (
  app: Application,
  swaggerConfigs: ISwaggerConfig[]
) => {
  swaggerConfigs.forEach((config) => {
    try {
      const fileContent = fs.readFileSync(config.yamlFilePath, "utf-8");
      const swaggerDocument = yaml.load(fileContent);

      if (!isValidSwaggerDoc(swaggerDocument)) {
        throw new ApiError(
          401,
          `Invalid Swagger document in ${config.yamlFilePath}`
        );
      }

      app.use(config.route, swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    } catch (error) {
      logger.error(error);
    }
  });
};

const isValidSwaggerDoc = (doc: unknown): doc is swaggerUi.JsonObject => {
  return (
    typeof doc === "object" &&
    doc !== null &&
    ("swagger" in (doc as Record<string, unknown>) ||
      "openapi" in (doc as Record<string, unknown>))
  );
};
