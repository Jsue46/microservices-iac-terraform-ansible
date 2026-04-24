import { medicalServicesSeed } from "../data/medicalServicesSeed.ts";
import type { MedicalServiceRecord, MedicalServiceRepositoryPort } from "../types.ts";

function cloneRecord(record: MedicalServiceRecord): MedicalServiceRecord {
  return JSON.parse(JSON.stringify(record)) as MedicalServiceRecord;
}

export class MedicalServiceRepository implements MedicalServiceRepositoryPort {
  records: MedicalServiceRecord[];

  constructor(seed: MedicalServiceRecord[] = medicalServicesSeed) {
    this.records = seed.map((item) => cloneRecord(item));
  }

  async initialize(): Promise<void> {
    return Promise.resolve();
  }

  async getAll(): Promise<MedicalServiceRecord[]> {
    return this.records.map((item) => cloneRecord(item));
  }

  async findById(id: string): Promise<MedicalServiceRecord | null> {
    const found = this.records.find((item) => item.id === id);
    return found ? cloneRecord(found) : null;
  }

  async findByCode(code: string): Promise<MedicalServiceRecord | null> {
    const normalizedCode = String(code).toUpperCase();
    const found = this.records.find((item) => item.code === normalizedCode);
    return found ? cloneRecord(found) : null;
  }

  async create(record: MedicalServiceRecord): Promise<MedicalServiceRecord> {
    this.records.push(cloneRecord(record));
    return cloneRecord(record);
  }

  async replace(id: string, nextRecord: MedicalServiceRecord): Promise<MedicalServiceRecord | null> {
    const index = this.records.findIndex((item) => item.id === id);

    if (index === -1) {
      return null;
    }

    this.records[index] = cloneRecord(nextRecord);
    return cloneRecord(this.records[index]);
  }

  async delete(id: string): Promise<boolean> {
    const index = this.records.findIndex((item) => item.id === id);

    if (index === -1) {
      return false;
    }

    this.records.splice(index, 1);
    return true;
  }
}
