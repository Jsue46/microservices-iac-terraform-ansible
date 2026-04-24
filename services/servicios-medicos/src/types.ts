import type { IncomingMessage } from "node:http";

export interface MedicalServiceRecord {
  id: string;
  code: string;
  name: string;
  shortDescription: string;
  technicalDescription: string;
  price: number;
  currency: string;
  availabilityStatus: "available" | "limited" | "unavailable";
  isActive: boolean;
  durationMinutes: number;
  preparationRequirements: string[];
  specialtyIds: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MedicalServicePayload {
  code?: string;
  name?: string;
  shortDescription?: string;
  technicalDescription?: string;
  price?: number;
  currency?: string;
  availabilityStatus?: "available" | "limited" | "unavailable";
  isActive?: boolean;
  durationMinutes?: number;
  preparationRequirements?: string[];
  specialtyIds?: string[];
  tags?: string[];
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
  query: Record<string, string>;
  raw: IncomingMessage;
  params: Record<string, string>;
  config: ServiceConfig;
}

export interface ListFilters {
  search: string | null;
  specialtyId: string | null;
  status: "available" | "limited" | "unavailable" | null;
  available: boolean | null;
  minPrice: number | null;
  maxPrice: number | null;
  sortBy: "name" | "price" | "createdAt" | "updatedAt";
  sortOrder: "asc" | "desc";
  page: number;
  pageSize: number;
}

export interface MedicalServiceRepositoryPort {
  initialize(): Promise<void>;
  close?(): Promise<void>;
  getAll(): Promise<MedicalServiceRecord[]>;
  findById(id: string): Promise<MedicalServiceRecord | null>;
  findByCode(code: string): Promise<MedicalServiceRecord | null>;
  create(record: MedicalServiceRecord): Promise<MedicalServiceRecord>;
  replace(id: string, nextRecord: MedicalServiceRecord): Promise<MedicalServiceRecord | null>;
  delete(id: string): Promise<boolean>;
}
