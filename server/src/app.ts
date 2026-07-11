import express from "express";
import type { Express } from "express";
import type { Request, Response } from "express";

import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import { pinoHttp } from "pino-http";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { requestId } from "./middlewares/requestId.js";
import { globalRateLimiter } from "./middlewares/rateLimiter.js";
import { notFoundHandler, errorHandler } from "./middlewares/errorHandler.js";
import { sendSuccess } from "./utils/apiResponse.js";
import { authRouter } from "./modules/auth/auth.routes.js";

export const app: Express = express();

// Request Setup (Order Matters)
app.use(requestId);

app.use(
  pinoHttp({
    logger,

    genReqId: (req) => req.id,

    autoLogging: {
      ignore: (req) => req.url === "/health",
    },
  }),
);

// Security
app.use(helmet());

app.use(
  cors({
    origin: env.clientOrigins,
    credentials: true,
  }),
);

app.use(
  express.json({
    limit: "10kb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10kb",
  }),
);

app.use(cookieParser());

app.use(mongoSanitize());

app.use(globalRateLimiter);

// Health Check
app.get("/health", (req: Request, res: Response) => {
  sendSuccess(res, {
    data: {
      status: "ok",
      uptime: process.uptime(),
    },
  });
});

// API Root
app.get("/api/v1", (req: Request, res: Response) => {
  sendSuccess(res, {
    data: null,
    message: "Credify API v1",
  });
});
app.use("/api/v1/auth", authRouter);

// Error Handling (Must Be Last)
app.use(notFoundHandler);
app.use(errorHandler);
