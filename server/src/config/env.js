import dotenv from "dotenv";

dotenv.config();

const runtimeEnvironment = process.env.APP_ENV || process.env.NODE_ENV || "development";
const isProduction = runtimeEnvironment === "production";

const getRequiredEnv = (name, fallback = "") => {
  const value = process.env[name] || fallback;

  if (!value && isProduction) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

export const env = {
  nodeEnv: runtimeEnvironment,
  isProduction,
  port: Number(process.env.PORT || 4000),
  jwtSecret: getRequiredEnv("JWT_SECRET", "change-this-secret"),
  databaseUrl: getRequiredEnv("DATABASE_URL"),
  clientUrl: getRequiredEnv("CLIENT_URL"),
};
