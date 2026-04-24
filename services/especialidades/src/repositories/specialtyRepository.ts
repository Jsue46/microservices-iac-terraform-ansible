import type { SpecialtyRecord } from "../types.ts";
import { specialtiesSeed } from "../data/specialtiesSeed.ts";

export interface SpecialtyRepositoryPort {
  initialize(): Promise<void>;
  getAll(): Promise<SpecialtyRecord[]>;
  findById(id: string): Promise<SpecialtyRecord | null>;
  findByCode(code: string): Promise<SpecialtyRecord | null>;
  create(record: SpecialtyRecord): Promise<SpecialtyRecord>;
  replace(id: string, next: SpecialtyRecord): Promise<SpecialtyRecord | null>;
  delete(id: string): Promise<boolean>;
}

let store: SpecialtyRecord[] = [];

export const specialtyRepository: SpecialtyRepositoryPort = {
  async initialize(): Promise<void> {
    store = specialtiesSeed.map((s) => ({ ...s }));
  },

  async getAll(): Promise<SpecialtyRecord[]> {
    return [...store];
  },

  async findById(id: string): Promise<SpecialtyRecord | null> {
    return store.find((s) => s.id === id) ?? null;
  },

  async findByCode(code: string): Promise<SpecialtyRecord | null> {
    return store.find((s) => s.code === code) ?? null;
  },

  async create(record: SpecialtyRecord): Promise<SpecialtyRecord> {
    store.push(record);
    return record;
  },

  async replace(id: string, next: SpecialtyRecord): Promise<SpecialtyRecord | null> {
    const idx = store.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    store[idx] = next;
    return next;
  },

  async delete(id: string): Promise<boolean> {
    const idx = store.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    store.splice(idx, 1);
    return true;
  },
};