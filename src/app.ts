import globalErrorhandler from "./app/middlewares/globalErrorHandler";
import { notFoundRoute } from "./app/middlewares/notFoundRoute";
import express, { Application } from "express";
import os from "os";
import path from "path";

import middlewares from "./app/config/middlewares";
import router from "./app/routes";
const app: Application = express();

//all middlewares
middlewares(app);

// test endpint
// app.use("/api/v1", (_, res: Response) => {
//   res.status(200).json({
//     success: true,
//     message: "Server Working !",
//   });
// });

app.get("/health", async (req, res) => {
  const healthcheck = {
    status: "ok",
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    timestamp: Date.now(),
    memory: {
      free: os.freemem(),
      total: os.totalmem(),
    },
  };

  res.json(healthcheck);
});

// Serve static files from public/uploads directory
app.use("/public", express.static(path.join(__dirname, "../public")));

// api endpoints
app.use("/api/v1", router);

// Global error handler
app.use(globalErrorhandler);

// handle not found route
app.use(notFoundRoute);

export default app;
