import type {
  SpecialtyPayload,
  SpecialtyRecord,
  SpecialtyRepositoryPort
} from "../types.ts";
import { randomUUID } from "node:crypto";

function createCode(name: string): string {
  return String(name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export class SpecialtyService {
  repository: SpecialtyRepositoryPort;

  constructor(repository: SpecialtyRepositoryPort) {
    this.repository = repository;
  }

  async getAll(): Promise<SpecialtyRecord[]> {
    return this.repository.getAll();
  }

  async getById(id: string): Promise<SpecialtyRecord | null> {
    return this.repository.findById(id);
  }

  async getByCode(code: string): Promise<SpecialtyRecord | null> {
    return this.repository.findByCode(code);
  }

  async create(payload: SpecialtyPayload): Promise<SpecialtyRecord> {
    const now = new Date().toISOString();
    const code = payload.code ? createCode(payload.code) : createCode(payload.name ?? "");
    const record: SpecialtyRecord = {
      id: randomUUID(),
      code,
      name: payload.name ?? "",
      description: payload.description ?? "",
      isActive: payload.isActive ?? true,
      serviceIds: payload.serviceIds ?? [],
      createdAt: now,
      updatedAt: now,
    };
    return this.repository.create(record);
  }

  async replace(id: string, payload: SpecialtyPayload): Promise<SpecialtyRecord | null> {
    const existing = await this.repository.findById(id);
    if (!existing) return null;
    const updated: SpecialtyRecord = {
      ...existing,
      ...payload,
      code: payload.code ? createCode(payload.code) : existing.code,
      id,
      updatedAt: new Date().toISOString(),
    };
    return this.repository.replace(id, updated);
  }

  async delete(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}
