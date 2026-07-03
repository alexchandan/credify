import mongoose from "mongoose";
import { app } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import type { Server } from "node:http";

let server: Server | undefined;

async function start(): Promise<void> {
  try {
    await mongoose.connect(env.mongodbUri);

    logger.info("Connected to MongoDB");

    server = app.listen(env.port, () => {
      logger.info(`Credify API listening on port ${env.port} [${env.nodeEnv}]`);
    });
  } catch (error: unknown) {
    logger.error({ error }, "Failed to start server");
    process.exit(1);
  }
}

process.on("unhandledRejection", (reason: unknown) => {
  logger.error({ reason }, "Unhandled promise rejection");
  process.exit(1);
});

// Graceful Shutdown
async function gracefulShutdown(signal: string): Promise<void> {
  logger.info(`Received ${signal}. Closing server...`);
  try {
    if (!server) {
      await mongoose.connection.close();
      logger.info("MongoDB connection closed. Exiting process.");
      process.exit(0);
    }
    server.close(async () => {
      logger.info("Server closed. Closing MongoDB connection...");
      await mongoose.connection.close();
      logger.info("MongoDB connection closed. Exiting process.");
      process.exit(0);
    });
  } catch (error: unknown) {
    logger.error({ error }, "Error during graceful shutdown");
    process.exit(1);
  }
}

// shutdown when the process receives SIGINT (Ctrl+C) or SIGTERM (termination signal)
process.on("SIGINT", () => {
  void gracefulShutdown("SIGINT");
});

// shutdown when the process receives SIGTERM (termination signal) eg. from Kubernetes or Docker
process.on("SIGTERM", () => {
  void gracefulShutdown("SIGTERM");
});

start();
