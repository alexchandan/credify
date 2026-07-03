import pino from "pino";
import { env } from "../config/env.js";

export const logger = pino({
  level: env.nodeEnv === "production" ? "info" : "debug",
  ...(env.nodeEnv !== "production" && {
    transport: { target: "pino-pretty", options: { colorize: true } },
    // Never log sensitive fields even if they end up in a logged object.
    redact: {
      paths: [
        "req.body.password",
        "req.body.confirmPassword",
        "req.body.token",
        "req.headers.authorization",
        "req.headers.cookie",
      ],
      censor: "[REDACTED]",
    },
  }),
});
