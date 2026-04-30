import type { IncomingMessage, ServerResponse } from "node:http";
import { SpecialtyService } from "../services/specialtyService.ts";
import { sendSuccess, sendCreated, sendError, readBody } from "../utils/http.ts";

export class SpecialtyController {
  service: SpecialtyService;

  constructor(service: SpecialtyService) {
    this.service = service;
  }

  async list(_req: IncomingMessage, res: ServerResponse): Promise<void> {
    const specialties = await this.service.getAll();
    sendSuccess(res, specialties, { total: specialties.length });
  }

  async getById(_req: IncomingMessage, res: ServerResponse, id: string): Promise<void> {
    const specialty = await this.service.getById(id);
    if (!specialty) {
      sendError(res, 404, "NOT_FOUND", `Especialidad con id '${id}' no encontrada.`);
      return;
    }
    sendSuccess(res, specialty);
  }

  async create(req: IncomingMessage, res: ServerResponse): Promise<void> {
    let body: Record<string, unknown>;
    try {
      body = await readBody(req);
    } catch {
      sendError(res, 400, "INVALID_JSON", "El cuerpo de la solicitud no es JSON valido.");
      return;
    }
    if (!body.name || typeof body.name !== "string") {
      sendError(res, 400, "VALIDATION_ERROR", "El campo 'name' es obligatorio.", ["name es requerido"]);
      return;
    }
    const created = await this.service.create(body);
    sendCreated(res, created);
  }

  async replace(req: IncomingMessage, res: ServerResponse, id: string): Promise<void> {
    let body: Record<string, unknown>;
    try {
      body = await readBody(req);
    } catch {
      sendError(res, 400, "INVALID_JSON", "El cuerpo de la solicitud no es JSON valido.");
      return;
    }
    const updated = await this.service.replace(id, body);
    if (!updated) {
      sendError(res, 404, "NOT_FOUND", `Especialidad con id '${id}' no encontrada.`);
      return;
    }
    sendSuccess(res, updated);
  }

  async remove(_req: IncomingMessage, res: ServerResponse, id: string): Promise<void> {
    const deleted = await this.service.delete(id);
    if (!deleted) {
      sendError(res, 404, "NOT_FOUND", `Especialidad con id '${id}' no encontrada.`);
      return;
    }
    sendSuccess(res, { message: "Especialidad eliminada correctamente." });
  }
}
