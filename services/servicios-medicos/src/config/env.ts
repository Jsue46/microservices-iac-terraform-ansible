import type { ServiceConfig } from "../types.ts";

const DEFAULT_PORT = 3001;
const DEFAULT_HOST = "0.0.0.0";
const DEFAULT_SERVICE_NAME = "servicios-medicos";
const DEFAULT_API_PREFIX = "/api/v1";
const DEFAULT_PERSISTENCE_MODE = "memory";
const DEFAULT_DATABASE_SCHEMA = "public";

function readPort(rawPort?: string): number {
  const parsed = Number.parseInt(rawPort ?? String(DEFAULT_PORT), 10);

  if (Number.isNaN(parsed) || parsed <= 0) {
    return DEFAULT_PORT;
  }

  return parsed;
}

export function getConfig(): ServiceConfig {
  const persistenceMode = process.env.PERSISTENCE_MODE === "postgres"
    ? "postgres"
    : DEFAULT_PERSISTENCE_MODE;

  return {
    port: readPort(process.env.PORT),
    host: process.env.HOST || DEFAULT_HOST,
    serviceName: process.env.SERVICE_NAME || DEFAULT_SERVICE_NAME,
    apiPrefix: process.env.API_PREFIX || DEFAULT_API_PREFIX,
    persistenceMode,
    databaseUrl: process.env.DATABASE_URL || null,
    databaseSsl: process.env.DATABASE_SSL === "true",
    databaseSchema: process.env.DATABASE_SCHEMA || DEFAULT_DATABASE_SCHEMA
  };
}
