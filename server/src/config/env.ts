import dotenv from "dotenv";

// Prefer .env.local (typically git-ignored, for real secrets), but fall
// back to .env — the documented setup path (`cp .env.example .env`, per
// README.md / docs/ENVIRONMENT_SETUP.md) must also work without silent
// failure. dotenv.config() never overrides a variable that's already
// set in process.env, so loading .env.local first correctly gives it
// precedence if both happen to exist.
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

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
const required = [
  "MONGODB_URI",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "RESEND_API_KEY",
] as const;

for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

export const env: Env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  clientOrigins: (process.env.CLIENT_ORIGIN || "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim()),
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
    // Resend's own test sender — works immediately with zero domain
    // setup, which matters for actually getting this running today.
    // Swap to a verified sender address once you own a domain in Resend.
    from: process.env.EMAIL_FROM!,
  },
};
