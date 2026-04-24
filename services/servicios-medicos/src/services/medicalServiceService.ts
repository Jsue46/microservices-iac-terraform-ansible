import type {
  ListFilters,
  MedicalServicePayload,
  MedicalServiceRecord,
  MedicalServiceRepositoryPort
} from "../types.ts";
import { HttpError, parseBoolean, parseInteger, parseNumber } from "../utils/http.ts";

const ALLOWED_STATUSES = new Set(["available", "limited", "unavailable"]);
const ALLOWED_SORT_FIELDS = new Set(["name", "price", "createdAt", "updatedAt"]);
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

function createSlug(value: string): string {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function buildId(records: MedicalServiceRecord[]): string {
  const numericIds = records
    .map((item) => Number.parseInt(item.id.replace("svc-", ""), 10))
    .filter((value) => Number.isInteger(value));

  const nextValue = (numericIds.length ? Math.max(...numericIds) : 0) + 1;
  return `svc-${String(nextValue).padStart(3, "0")}`;
}

function ensureStringArray(
  value: unknown,
  fieldName: string,
  errors: string[]
): string[] {
  if (value === undefined) {
    return [];
  }

  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || !item.trim())) {
    errors.push(`${fieldName} debe ser un arreglo de cadenas no vacias.`);
    return [];
  }

  return value.map((item) => item.trim());
}

function validatePayload(
  payload: MedicalServicePayload,
  options: { partial?: boolean } = {}
): MedicalServicePayload {
  const { partial = false } = options;
  const errors: string[] = [];
  const normalized: MedicalServicePayload = {};

  if (!partial || payload.name !== undefined) {
    if (typeof payload.name !== "string" || payload.name.trim().length < 3) {
      errors.push("name debe ser una cadena de al menos 3 caracteres.");
    } else {
      normalized.name = payload.name.trim();
    }
  }

  if (!partial || payload.shortDescription !== undefined) {
    if (
      typeof payload.shortDescription !== "string" ||
      payload.shortDescription.trim().length < 10
    ) {
      errors.push("shortDescription debe ser una cadena de al menos 10 caracteres.");
    } else {
      normalized.shortDescription = payload.shortDescription.trim();
    }
  }

  if (!partial || payload.technicalDescription !== undefined) {
    if (
      typeof payload.technicalDescription !== "string" ||
      payload.technicalDescription.trim().length < 15
    ) {
      errors.push("technicalDescription debe ser una cadena de al menos 15 caracteres.");
    } else {
      normalized.technicalDescription = payload.technicalDescription.trim();
    }
  }

  if (!partial || payload.price !== undefined) {
    if (typeof payload.price !== "number" || !Number.isFinite(payload.price) || payload.price < 0) {
      errors.push("price debe ser un numero mayor o igual a 0.");
    } else {
      normalized.price = Number(payload.price);
    }
  }

  if (payload.currency !== undefined) {
    if (typeof payload.currency !== "string" || payload.currency.trim().length !== 3) {
      errors.push("currency debe ser una cadena de 3 caracteres.");
    } else {
      normalized.currency = payload.currency.trim().toUpperCase();
    }
  } else if (!partial) {
    normalized.currency = "GTQ";
  }

  if (payload.code !== undefined) {
    if (typeof payload.code !== "string" || payload.code.trim().length < 3) {
      errors.push("code debe ser una cadena de al menos 3 caracteres.");
    } else {
      normalized.code = createSlug(payload.code);
    }
  }

  if (payload.availabilityStatus !== undefined) {
    if (!ALLOWED_STATUSES.has(payload.availabilityStatus)) {
      errors.push("availabilityStatus debe ser available, limited o unavailable.");
    } else {
      normalized.availabilityStatus = payload.availabilityStatus;
    }
  } else if (!partial) {
    normalized.availabilityStatus = "available";
  }

  if (payload.isActive !== undefined) {
    if (typeof payload.isActive !== "boolean") {
      errors.push("isActive debe ser un valor booleano.");
    } else {
      normalized.isActive = payload.isActive;
    }
  } else if (!partial) {
    normalized.isActive = true;
  }

  if (payload.durationMinutes !== undefined) {
    if (!Number.isInteger(payload.durationMinutes) || payload.durationMinutes <= 0) {
      errors.push("durationMinutes debe ser un entero positivo.");
    } else {
      normalized.durationMinutes = payload.durationMinutes;
    }
  } else if (!partial) {
    normalized.durationMinutes = 30;
  }

  if (!partial || payload.preparationRequirements !== undefined) {
    normalized.preparationRequirements = ensureStringArray(
      payload.preparationRequirements,
      "preparationRequirements",
      errors
    );
  }

  if (!partial || payload.specialtyIds !== undefined) {
    normalized.specialtyIds = ensureStringArray(payload.specialtyIds, "specialtyIds", errors);
  }

  if (!partial || payload.tags !== undefined) {
    normalized.tags = ensureStringArray(payload.tags, "tags", errors);
  }

  if (errors.length > 0) {
    throw new HttpError(
      400,
      "VALIDATION_ERROR",
      "La solicitud contiene datos invalidos.",
      errors
    );
  }

  return normalized;
}

function parseListFilters(query: Record<string, string>): ListFilters {
  const page = parseInteger(query.page) ?? DEFAULT_PAGE;
  const pageSize = parseInteger(query.pageSize) ?? DEFAULT_PAGE_SIZE;
  const minPrice = parseNumber(query.minPrice);
  const maxPrice = parseNumber(query.maxPrice);
  const available = parseBoolean(query.available);
  const sortBy = query.sortBy && ALLOWED_SORT_FIELDS.has(query.sortBy)
    ? (query.sortBy as ListFilters["sortBy"])
    : "name";
  const sortOrder = query.sortOrder === "desc" ? "desc" : "asc";

  if (page <= 0) {
    throw new HttpError(400, "INVALID_QUERY", "page debe ser mayor que 0.");
  }

  if (pageSize <= 0 || pageSize > MAX_PAGE_SIZE) {
    throw new HttpError(
      400,
      "INVALID_QUERY",
      `pageSize debe estar entre 1 y ${MAX_PAGE_SIZE}.`
    );
  }

  if (minPrice !== null && minPrice < 0) {
    throw new HttpError(400, "INVALID_QUERY", "minPrice no puede ser negativo.");
  }

  if (maxPrice !== null && maxPrice < 0) {
    throw new HttpError(400, "INVALID_QUERY", "maxPrice no puede ser negativo.");
  }

  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    throw new HttpError(400, "INVALID_QUERY", "minPrice no puede ser mayor que maxPrice.");
  }

  return {
    search: query.search ? String(query.search).trim().toLowerCase() : null,
    specialtyId: query.specialtyId ? String(query.specialtyId).trim().toLowerCase() : null,
    status: query.status
      ? (String(query.status).trim() as ListFilters["status"])
      : null,
    available,
    minPrice,
    maxPrice,
    sortBy,
    sortOrder,
    page,
    pageSize
  };
}

export class MedicalServiceService {
  repository: MedicalServiceRepositoryPort;

  constructor(repository: MedicalServiceRepositoryPort) {
    this.repository = repository;
  }

  async list(query: Record<string, string> = {}) {
    const filters = parseListFilters(query);
    let items = await this.repository.getAll();

    if (filters.search) {
      items = items.filter((item) => {
        const haystack = [
          item.code,
          item.name,
          item.shortDescription,
          item.technicalDescription
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(filters.search as string);
      });
    }

    if (filters.specialtyId) {
      items = items.filter((item) =>
        item.specialtyIds.map((value) => value.toLowerCase()).includes(filters.specialtyId as string)
      );
    }

    if (filters.status) {
      if (!ALLOWED_STATUSES.has(filters.status)) {
        throw new HttpError(
          400,
          "INVALID_QUERY",
          "status debe ser available, limited o unavailable."
        );
      }

      items = items.filter((item) => item.availabilityStatus === filters.status);
    }

    if (filters.available !== null) {
      items = items.filter(
        (item) =>
          item.isActive === filters.available &&
          (filters.available ? item.availabilityStatus === "available" : true)
      );
    }

    if (filters.minPrice !== null) {
      items = items.filter((item) => item.price >= filters.minPrice);
    }

    if (filters.maxPrice !== null) {
      items = items.filter((item) => item.price <= filters.maxPrice);
    }

    items.sort((left, right) => {
      const direction = filters.sortOrder === "asc" ? 1 : -1;
      const leftValue = left[filters.sortBy];
      const rightValue = right[filters.sortBy];

      if (leftValue < rightValue) {
        return -1 * direction;
      }

      if (leftValue > rightValue) {
        return 1 * direction;
      }

      return 0;
    });

    const totalItems = items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / filters.pageSize));
    const start = (filters.page - 1) * filters.pageSize;
    const paginatedItems = items.slice(start, start + filters.pageSize);

    return {
      items: paginatedItems,
      meta: {
        page: filters.page,
        pageSize: filters.pageSize,
        totalItems,
        totalPages,
        filters
      }
    };
  }

  async getById(id: string): Promise<MedicalServiceRecord> {
    const item = await this.repository.findById(id);

    if (!item) {
      throw new HttpError(404, "NOT_FOUND", "Servicio medico no encontrado.");
    }

    return item;
  }

  async getByCode(code: string): Promise<MedicalServiceRecord> {
    const item = await this.repository.findByCode(code);

    if (!item) {
      throw new HttpError(404, "NOT_FOUND", "Servicio medico no encontrado.");
    }

    return item;
  }

  async create(payload: MedicalServicePayload): Promise<MedicalServiceRecord> {
    const normalized = validatePayload(payload);
    const currentItems = await this.repository.getAll();
    const id = buildId(currentItems);
    const now = new Date().toISOString();
    const code = normalized.code || createSlug(normalized.name as string);

    if (await this.repository.findByCode(code)) {
      throw new HttpError(409, "DUPLICATE_CODE", "Ya existe un servicio con ese codigo.");
    }

    const record: MedicalServiceRecord = {
      id,
      code,
      name: normalized.name as string,
      shortDescription: normalized.shortDescription as string,
      technicalDescription: normalized.technicalDescription as string,
      price: normalized.price as number,
      currency: normalized.currency as string,
      availabilityStatus: normalized.availabilityStatus as MedicalServiceRecord["availabilityStatus"],
      isActive: normalized.isActive as boolean,
      durationMinutes: normalized.durationMinutes as number,
      preparationRequirements: normalized.preparationRequirements as string[],
      specialtyIds: normalized.specialtyIds as string[],
      tags: normalized.tags as string[],
      createdAt: now,
      updatedAt: now
    };

    return this.repository.create(record);
  }

  async replace(id: string, payload: MedicalServicePayload): Promise<MedicalServiceRecord | null> {
    const current = await this.getById(id);
    const normalized = validatePayload(payload);
    const code = normalized.code || current.code || createSlug(normalized.name as string);
    const existingCodeOwner = await this.repository.findByCode(code);

    if (existingCodeOwner && existingCodeOwner.id !== id) {
      throw new HttpError(409, "DUPLICATE_CODE", "Ya existe un servicio con ese codigo.");
    }

    const nextRecord: MedicalServiceRecord = {
      ...current,
      name: normalized.name as string,
      shortDescription: normalized.shortDescription as string,
      technicalDescription: normalized.technicalDescription as string,
      price: normalized.price as number,
      currency: normalized.currency as string,
      availabilityStatus: normalized.availabilityStatus as MedicalServiceRecord["availabilityStatus"],
      isActive: normalized.isActive as boolean,
      durationMinutes: normalized.durationMinutes as number,
      preparationRequirements: normalized.preparationRequirements as string[],
      specialtyIds: normalized.specialtyIds as string[],
      tags: normalized.tags as string[],
      id,
      code,
      createdAt: current.createdAt,
      updatedAt: new Date().toISOString()
    };

    return this.repository.replace(id, nextRecord);
  }

  async updateStatus(
    id: string,
    payload: Pick<MedicalServicePayload, "availabilityStatus" | "isActive">
  ): Promise<MedicalServiceRecord | null> {
    if (payload.availabilityStatus === undefined && payload.isActive === undefined) {
      throw new HttpError(
        400,
        "VALIDATION_ERROR",
        "Debe enviar availabilityStatus, isActive o ambos."
      );
    }

    const current = await this.getById(id);
    const nextStatus = payload.availabilityStatus ?? current.availabilityStatus;
    const nextIsActive = payload.isActive ?? current.isActive;

    if (!ALLOWED_STATUSES.has(nextStatus)) {
      throw new HttpError(
        400,
        "VALIDATION_ERROR",
        "availabilityStatus debe ser available, limited o unavailable."
      );
    }

    if (payload.isActive !== undefined && typeof payload.isActive !== "boolean") {
      throw new HttpError(400, "VALIDATION_ERROR", "isActive debe ser booleano.");
    }

    const nextRecord: MedicalServiceRecord = {
      ...current,
      availabilityStatus: nextStatus as MedicalServiceRecord["availabilityStatus"],
      isActive: nextIsActive,
      updatedAt: new Date().toISOString()
    };

    return this.repository.replace(id, nextRecord);
  }

  async delete(id: string): Promise<{ message: string }> {
    await this.getById(id);
    await this.repository.delete(id);
    return {
      message: "Servicio medico eliminado correctamente."
    };
  }
}
