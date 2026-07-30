import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" }); //fallback

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
] as const;

const missingRequiredEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingRequiredEnv.length > 0) {
  console.warn(
    [
      "Missing required environment variable:",
      ...missingRequiredEnv.map((key) => key),
    ].join("\n"),
  );
  process.exit(1);
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
    from: process.env.EMAIL_FROM as string,
  },
};
