import express from "express";
import type { Express } from "express";
import type { Request, Response } from "express";

import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { mongoSanitize } from "./middlewares/mongoSanitize.js";
import { pinoHttp } from "pino-http";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { requestId } from "./middlewares/requestId.js";
import { globalRateLimiter } from "./middlewares/rateLimiter.js";
import { notFoundHandler, errorHandler } from "./middlewares/errorHandler.js";
import { sendSuccess } from "./utils/apiResponse.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { candidateRouter } from "./modules/candidate/candidateProfile.routes.js";
import { companyRouter } from "./modules/company/company.routes.js";
import { recruiterRouter } from "./modules/recruiter/recruiterProfile.routes.js";
import { jobRouter } from "./modules/job/job.routes.js";
import { applicationRouter } from "./modules/application/application.routes.js";
import { searchRouter } from "./modules/search/search.routes.js";
import { savedCandidateRouter } from "./modules/savedCandidate/savedCandidate.routes.js";
import { notificationRouter } from "./modules/notification/notification.routes.js";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes.js";
import { adminRouter } from "./modules/admin/admin.routes.js";

export const app: Express = express();

// it'll get client's real ip instead of proxy's ip
if (env.nodeEnv === "production") {
  app.set("trust proxy", 1);
}

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

// ---- Routes ----
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/candidates", candidateRouter);
app.use("/api/v1/companies", companyRouter);
app.use("/api/v1/recruiters", recruiterRouter);
app.use("/api/v1/jobs", jobRouter);
app.use("/api/v1/applications", applicationRouter);
app.use("/api/v1/search", searchRouter);
app.use("/api/v1/savedCandidate", savedCandidateRouter);
app.use("/api/v1/notification", notificationRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/admin", adminRouter);

// Error Handling (Must Be Last)
app.use(notFoundHandler);
app.use(errorHandler);
