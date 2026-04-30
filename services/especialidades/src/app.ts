import type { IncomingMessage, ServerResponse } from "node:http";
import { SpecialtyController } from "./controllers/specialtyController.ts";
import { specialtyRouter } from "./routes/specialtyRouter.ts";
import { sendJson, sendError } from "./utils/http.ts";
import { getConfig } from "./config/env.ts";
import { SpecialtyRepository } from "./repositories/specialtyRepository.ts";
import { PostgresSpecialtyRepository } from "./repositories/postgresSpecialtyRepository.ts";
import { SpecialtyService } from "./services/specialtyService.ts";
import type { SpecialtyRepositoryPort } from "./types.ts";

async function createRepository(): Promise<SpecialtyRepositoryPort> {
  const config = getConfig();

  if (config.persistenceMode === "postgres") {
    const repository = new PostgresSpecialtyRepository(config);
    await repository.initialize();
    return repository;
  }

  const repository = new SpecialtyRepository();
  await repository.initialize();
  return repository;
}

export async function createApp(): Promise<(req: IncomingMessage, res: ServerResponse) => void> {
  const config = getConfig();
  const repository = await createRepository();
  const service = new SpecialtyService(repository);
  const controller = new SpecialtyController(service);

  return function handler(req: IncomingMessage, res: ServerResponse): void {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
    const pathname = url.pathname;

    if (pathname === "/health") {
      sendJson(res, 200, {
        success: true,
        data: {
          service: config.serviceName,
          status: "ok",
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const handled = specialtyRouter(controller, req, res, pathname);
    if (!handled) {
      sendError(res, 404, "NOT_FOUND", "Ruta no encontrada.");
    }
  };
}
