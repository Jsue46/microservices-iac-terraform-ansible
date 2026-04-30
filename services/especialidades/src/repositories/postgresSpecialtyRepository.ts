import { Pool } from "pg";
import { specialtiesSeed } from "../data/specialtiesSeed.ts";
import type {
  ServiceConfig,
  SpecialtyRecord,
  SpecialtyRepositoryPort
} from "../types.ts";

function validateSchemaName(schema: string): string {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(schema)) {
    throw new Error("DATABASE_SCHEMA contiene un valor invalido.");
  }

  return schema;
}

function normalizeRecord(row: Record<string, unknown>): SpecialtyRecord {
  return {
    id: String(row.id),
    code: String(row.code),
    name: String(row.name),
    description: String(row.description),
    isActive: Boolean(row.is_active),
    serviceIds: Array.isArray(row.service_ids) ? (row.service_ids as string[]) : [],
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString()
  };
}

export class PostgresSpecialtyRepository implements SpecialtyRepositoryPort {
  pool: Pool;
  schema: string;

  constructor(config: ServiceConfig) {
    if (!config.databaseUrl) {
      throw new Error("DATABASE_URL es obligatorio cuando PERSISTENCE_MODE=postgres.");
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
      CREATE TABLE IF NOT EXISTS ${this.schema}.specialties (
        id VARCHAR(64) PRIMARY KEY,
        code VARCHAR(128) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        is_active BOOLEAN NOT NULL,
        service_ids TEXT[] NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL
      );
    `;

    await this.pool.query(createSchemaSql);
    await this.pool.query(createTableSql);

    const countResult = await this.pool.query(
      `SELECT COUNT(*)::int AS total FROM ${this.schema}.specialties`
    );

    if ((countResult.rows[0]?.total ?? 0) === 0) {
      for (const record of specialtiesSeed) {
        await this.create(record);
      }
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  async getAll(): Promise<SpecialtyRecord[]> {
    const result = await this.pool.query(
      `SELECT * FROM ${this.schema}.specialties ORDER BY name ASC`
    );
    return result.rows.map((row) => normalizeRecord(row));
  }

  async findById(id: string): Promise<SpecialtyRecord | null> {
    const result = await this.pool.query(
      `SELECT * FROM ${this.schema}.specialties WHERE id = $1 LIMIT 1`,
      [id]
    );
    return result.rows[0] ? normalizeRecord(result.rows[0]) : null;
  }

  async findByCode(code: string): Promise<SpecialtyRecord | null> {
    const result = await this.pool.query(
      `SELECT * FROM ${this.schema}.specialties WHERE code = $1 LIMIT 1`,
      [String(code).toUpperCase()]
    );
    return result.rows[0] ? normalizeRecord(result.rows[0]) : null;
  }

  async create(record: SpecialtyRecord): Promise<SpecialtyRecord> {
    await this.pool.query(
      `
        INSERT INTO ${this.schema}.specialties (
          id, code, name, description, is_active, service_ids, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8
        )
      `,
      [
        record.id,
        record.code,
        record.name,
        record.description,
        record.isActive,
        record.serviceIds,
        record.createdAt,
        record.updatedAt
      ]
    );

    return record;
  }

  async replace(id: string, next: SpecialtyRecord): Promise<SpecialtyRecord | null> {
    const result = await this.pool.query(
      `
        UPDATE ${this.schema}.specialties
        SET
          code = $2,
          name = $3,
          description = $4,
          is_active = $5,
          service_ids = $6,
          created_at = $7,
          updated_at = $8
        WHERE id = $1
        RETURNING *
      `,
      [
        id,
        next.code,
        next.name,
        next.description,
        next.isActive,
        next.serviceIds,
        next.createdAt,
        next.updatedAt
      ]
    );

    return result.rows[0] ? normalizeRecord(result.rows[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.pool.query(
      `DELETE FROM ${this.schema}.specialties WHERE id = $1`,
      [id]
    );
    return result.rowCount > 0;
  }
}
