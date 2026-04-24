import { Pool } from "pg";
import { medicalServicesSeed } from "../data/medicalServicesSeed.ts";
import type {
  MedicalServiceRecord,
  MedicalServiceRepositoryPort,
  ServiceConfig
} from "../types.ts";
import { HttpError } from "../utils/http.ts";

function validateSchemaName(schema: string): string {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(schema)) {
    throw new HttpError(
      500,
      "DATABASE_CONFIG_ERROR",
      "DATABASE_SCHEMA contiene un valor invalido."
    );
  }

  return schema;
}

function normalizeRecord(row: Record<string, unknown>): MedicalServiceRecord {
  return {
    id: String(row.id),
    code: String(row.code),
    name: String(row.name),
    shortDescription: String(row.short_description),
    technicalDescription: String(row.technical_description),
    price: Number(row.price),
    currency: String(row.currency),
    availabilityStatus: row.availability_status as MedicalServiceRecord["availabilityStatus"],
    isActive: Boolean(row.is_active),
    durationMinutes: Number(row.duration_minutes),
    preparationRequirements: Array.isArray(row.preparation_requirements)
      ? (row.preparation_requirements as string[])
      : [],
    specialtyIds: Array.isArray(row.specialty_ids) ? (row.specialty_ids as string[]) : [],
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString()
  };
}

export class PostgresMedicalServiceRepository implements MedicalServiceRepositoryPort {
  pool: Pool;
  schema: string;

  constructor(config: ServiceConfig) {
    if (!config.databaseUrl) {
      throw new HttpError(
        500,
        "DATABASE_CONFIG_ERROR",
        "DATABASE_URL es obligatorio cuando PERSISTENCE_MODE=postgres."
      );
    }

    this.schema = validateSchemaName(config.databaseSchema);
    this.pool = new Pool({
      connectionString: config.databaseUrl,
      ssl: config.databaseSsl ? { rejectUnauthorized: false } : false
    });
  }

  async initialize(): Promise<void> {
    const createSchemaSql = `CREATE SCHEMA IF NOT EXISTS ${this.schema};`;
    const createTableSql = `
      CREATE TABLE IF NOT EXISTS ${this.schema}.medical_services (
        id VARCHAR(32) PRIMARY KEY,
        code VARCHAR(128) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        short_description TEXT NOT NULL,
        technical_description TEXT NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        currency VARCHAR(8) NOT NULL,
        availability_status VARCHAR(32) NOT NULL,
        is_active BOOLEAN NOT NULL,
        duration_minutes INTEGER NOT NULL,
        preparation_requirements TEXT[] NOT NULL DEFAULT '{}',
        specialty_ids TEXT[] NOT NULL DEFAULT '{}',
        tags TEXT[] NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL
      );
    `;

    await this.pool.query(createSchemaSql);
    await this.pool.query(createTableSql);

    const countResult = await this.pool.query(
      `SELECT COUNT(*)::int AS total FROM ${this.schema}.medical_services`
    );

    if ((countResult.rows[0]?.total ?? 0) === 0) {
      for (const record of medicalServicesSeed) {
        await this.create(record);
      }
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  async getAll(): Promise<MedicalServiceRecord[]> {
    const result = await this.pool.query(
      `SELECT * FROM ${this.schema}.medical_services`
    );
    return result.rows.map((row) => normalizeRecord(row));
  }

  async findById(id: string): Promise<MedicalServiceRecord | null> {
    const result = await this.pool.query(
      `SELECT * FROM ${this.schema}.medical_services WHERE id = $1 LIMIT 1`,
      [id]
    );
    return result.rows[0] ? normalizeRecord(result.rows[0]) : null;
  }

  async findByCode(code: string): Promise<MedicalServiceRecord | null> {
    const result = await this.pool.query(
      `SELECT * FROM ${this.schema}.medical_services WHERE code = $1 LIMIT 1`,
      [String(code).toUpperCase()]
    );
    return result.rows[0] ? normalizeRecord(result.rows[0]) : null;
  }

  async create(record: MedicalServiceRecord): Promise<MedicalServiceRecord> {
    await this.pool.query(
      `
        INSERT INTO ${this.schema}.medical_services (
          id, code, name, short_description, technical_description, price, currency,
          availability_status, is_active, duration_minutes, preparation_requirements,
          specialty_ids, tags, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11,
          $12, $13, $14, $15
        )
      `,
      [
        record.id,
        record.code,
        record.name,
        record.shortDescription,
        record.technicalDescription,
        record.price,
        record.currency,
        record.availabilityStatus,
        record.isActive,
        record.durationMinutes,
        record.preparationRequirements,
        record.specialtyIds,
        record.tags,
        record.createdAt,
        record.updatedAt
      ]
    );

    return record;
  }

  async replace(id: string, nextRecord: MedicalServiceRecord): Promise<MedicalServiceRecord | null> {
    const result = await this.pool.query(
      `
        UPDATE ${this.schema}.medical_services
        SET
          code = $2,
          name = $3,
          short_description = $4,
          technical_description = $5,
          price = $6,
          currency = $7,
          availability_status = $8,
          is_active = $9,
          duration_minutes = $10,
          preparation_requirements = $11,
          specialty_ids = $12,
          tags = $13,
          created_at = $14,
          updated_at = $15
        WHERE id = $1
        RETURNING *
      `,
      [
        id,
        nextRecord.code,
        nextRecord.name,
        nextRecord.shortDescription,
        nextRecord.technicalDescription,
        nextRecord.price,
        nextRecord.currency,
        nextRecord.availabilityStatus,
        nextRecord.isActive,
        nextRecord.durationMinutes,
        nextRecord.preparationRequirements,
        nextRecord.specialtyIds,
        nextRecord.tags,
        nextRecord.createdAt,
        nextRecord.updatedAt
      ]
    );

    return result.rows[0] ? normalizeRecord(result.rows[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.pool.query(
      `DELETE FROM ${this.schema}.medical_services WHERE id = $1`,
      [id]
    );
    return result.rowCount > 0;
  }
}
