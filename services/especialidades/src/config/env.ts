import type { ServiceConfig } from "../types.ts";

const DEFAULT_PORT = 3002;
const DEFAULT_HOST = "0.0.0.0";
const DEFAULT_SERVICE_NAME = "especialidades";
const DEFAULT_API_PREFIX = "/api/v1";

function readPort(rawPort?: string): number {
  const parsed = Number.parseInt(rawPort ?? String(DEFAULT_PORT), 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return DEFAULT_PORT;
  }
  return parsed;
}

export function getConfig(): ServiceConfig {
  return {
    port: readPort(process.env.PORT),
    host: process.env.HOST || DEFAULT_HOST,
    serviceName: process.env.SERVICE_NAME || DEFAULT_SERVICE_NAME,
    apiPrefix: process.env.API_PREFIX || DEFAULT_API_PREFIX,
  };
}