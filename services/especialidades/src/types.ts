import type { IncomingMessage } from "node:http";

export interface SpecialtyRecord {
  id: string;
  code: string;
  name: string;
  description: string;
  isActive: boolean;
  serviceIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SpecialtyPayload {
  code?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
  serviceIds?: string[];
}

export interface ServiceConfig {
  port: number;
  host: string;
  serviceName: string;
  apiPrefix: string;
}

export interface RequestContext {
  method?: string;
  pathname: string;
  raw: IncomingMessage;
  params: Record<string, string>;
  config: ServiceConfig;
}