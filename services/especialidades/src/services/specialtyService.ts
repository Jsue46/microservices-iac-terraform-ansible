import type { SpecialtyRecord, SpecialtyPayload } from "../types.ts";
import { specialtyRepository } from "../repositories/specialtyRepository.ts";
import { randomUUID } from "node:crypto";

export const specialtyService = {
  async getAll(): Promise<SpecialtyRecord[]> {
    return specialtyRepository.getAll();
  },

  async getById(id: string): Promise<SpecialtyRecord | null> {
    return specialtyRepository.findById(id);
  },

  async getByCode(code: string): Promise<SpecialtyRecord | null> {
    return specialtyRepository.findByCode(code);
  },

  async create(payload: SpecialtyPayload): Promise<SpecialtyRecord> {
    const now = new Date().toISOString();
    const record: SpecialtyRecord = {
      id: randomUUID(),
      code: payload.code ?? (payload.name ?? "").toUpperCase().replace(/\s+/g, "-"),
      name: payload.name ?? "",
      description: payload.description ?? "",
      isActive: payload.isActive ?? true,
      serviceIds: payload.serviceIds ?? [],
      createdAt: now,
      updatedAt: now,
    };
    return specialtyRepository.create(record);
  },

  async replace(id: string, payload: SpecialtyPayload): Promise<SpecialtyRecord | null> {
    const existing = await specialtyRepository.findById(id);
    if (!existing) return null;
    const updated: SpecialtyRecord = {
      ...existing,
      ...payload,
      id,
      updatedAt: new Date().toISOString(),
    };
    return specialtyRepository.replace(id, updated);
  },

  async delete(id: string): Promise<boolean> {
    return specialtyRepository.delete(id);
  },
};