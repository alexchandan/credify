import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" }); //fallback

const nodeEnv = process.env.NODE_ENV || "development";

interface Env {
  nodeEnv: string;
  port: number;
  clientOrigins: string[];
  mongodbUri: string;
  jwt: {
    accessSecret: string;
    refreshSecret: string;
  };
  cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  };
  email: {
    resendApiKey: string;
    from: string;
  };
}

// Fail fast: if a required env var is missing, crash on boot rather than
// mysteriously later at runtime.
const requiredEnv = [
  "MONGODB_URI",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "RESEND_API_KEY",
  "EMAIL_FROM",
  ...(nodeEnv === "production" ? (["CLIENT_ORIGIN"] as const) : []),
] as const;

const missingRequiredEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingRequiredEnv.length > 0) {
  console.error(
    [
      "Missing required environment variable:",
      ...missingRequiredEnv.map((key) => key),
    ].join("\n"),
  );
  process.exit(1);
}

if (!new Set(["development", "test", "production"]).has(nodeEnv)) {
  console.error(`Invalid NODE_ENV: ${nodeEnv}`);
  process.exit(1);
}

const port = Number(process.env.PORT || 5000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error("PORT must be an integer between 1 and 65535");
  process.exit(1);
}

const clientOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

for (const origin of clientOrigins) {
  try {
    const parsed = new URL(origin);
    if (
      !["http:", "https:"].includes(parsed.protocol) ||
      parsed.origin !== origin
    ) {
      throw new Error("not an HTTP origin");
    }
  } catch {
    console.error(`CLIENT_ORIGIN contains an invalid origin: ${origin}`);
    process.exit(1);
  }
}

if (nodeEnv === "production") {
  for (const key of ["JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"] as const) {
    if ((process.env[key]?.length ?? 0) < 32) {
      console.error(`${key} must contain at least 32 characters in production`);
      process.exit(1);
    }
  }
}

export const env: Env = {
  nodeEnv,
  port,
  clientOrigins,
  mongodbUri: process.env.MONGODB_URI as string,
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET as string,
    refreshSecret: process.env.JWT_REFRESH_SECRET as string,
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME as string,
    apiKey: process.env.CLOUDINARY_API_KEY as string,
    apiSecret: process.env.CLOUDINARY_API_SECRET as string,
  },
  email: {
    resendApiKey: process.env.RESEND_API_KEY as string,
    from: process.env.EMAIL_FROM as string,
  },
};
