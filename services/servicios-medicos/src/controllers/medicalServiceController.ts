import type { ServerResponse } from "node:http";
import type { RequestContext, ServiceConfig } from "../types.ts";
import { readJsonBody, sendSuccess } from "../utils/http.ts";
import { MedicalServiceService } from "../services/medicalServiceService.ts";

export class MedicalServiceController {
  service: MedicalServiceService;

  constructor(service: MedicalServiceService) {
    this.service = service;
  }

  health(_request: RequestContext, response: ServerResponse, config: ServiceConfig): void {
    sendSuccess(response, 200, {
      service: config.serviceName,
      status: "ok",
      timestamp: new Date().toISOString()
    });
  }

  async list(request: RequestContext, response: ServerResponse): Promise<void> {
    const { items, meta } = await this.service.list(request.query);
    sendSuccess(response, 200, items, meta);
  }

  async getById(request: RequestContext, response: ServerResponse): Promise<void> {
    const item = await this.service.getById(request.params.id);
    sendSuccess(response, 200, item);
  }

  async getByCode(request: RequestContext, response: ServerResponse): Promise<void> {
    const item = await this.service.getByCode(request.params.code);
    sendSuccess(response, 200, item);
  }

  async create(request: RequestContext, response: ServerResponse): Promise<void> {
    const payload = await readJsonBody(request.raw);
    const created = await this.service.create(payload);
    sendSuccess(response, 201, created);
  }

  async replace(request: RequestContext, response: ServerResponse): Promise<void> {
    const payload = await readJsonBody(request.raw);
    const updated = await this.service.replace(request.params.id, payload);
    sendSuccess(response, 200, updated);
  }

  async updateStatus(request: RequestContext, response: ServerResponse): Promise<void> {
    const payload = await readJsonBody(request.raw);
    const updated = await this.service.updateStatus(request.params.id, payload);
    sendSuccess(response, 200, updated);
  }

  async delete(request: RequestContext, response: ServerResponse): Promise<void> {
    const result = await this.service.delete(request.params.id);
    sendSuccess(response, 200, result);
  }
}
