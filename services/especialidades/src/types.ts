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
  persistenceMode: "memory" | "postgres";
  databaseUrl: string | null;
  databaseSsl: boolean;
  databaseSchema: string;
}

export interface RequestContext {
  method?: string;
  pathname: string;
  raw: IncomingMessage;
  params: Record<string, string>;
  config: ServiceConfig;
}

export interface SpecialtyRepositoryPort {
  initialize(): Promise<void>;
  close?(): Promise<void>;
  getAll(): Promise<SpecialtyRecord[]>;
  findById(id: string): Promise<SpecialtyRecord | null>;
  findByCode(code: string): Promise<SpecialtyRecord | null>;
  create(record: SpecialtyRecord): Promise<SpecialtyRecord>;
  replace(id: string, next: SpecialtyRecord): Promise<SpecialtyRecord | null>;
  delete(id: string): Promise<boolean>;
}
