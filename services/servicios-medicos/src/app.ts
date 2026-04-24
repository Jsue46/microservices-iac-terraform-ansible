import type { IncomingMessage, ServerResponse } from "node:http";
import { getConfig } from "./config/env.ts";
import { MedicalServiceController } from "./controllers/medicalServiceController.ts";
import { MedicalServiceRepository } from "./repositories/medicalServiceRepository.ts";
import { PostgresMedicalServiceRepository } from "./repositories/postgresMedicalServiceRepository.ts";
import { createRouter } from "./routes/medicalServiceRouter.ts";
import { MedicalServiceService } from "./services/medicalServiceService.ts";
import type { MedicalServiceRepositoryPort } from "./types.ts";
import { sendError } from "./utils/http.ts";

async function createRepository(): Promise<MedicalServiceRepositoryPort> {
  const config = getConfig();

  if (config.persistenceMode === "postgres") {
    const repository = new PostgresMedicalServiceRepository(config);
    await repository.initialize();
    return repository;
  }

  const repository = new MedicalServiceRepository();
  await repository.initialize();
  return repository;
}

export async function createApp() {
  const config = getConfig();
  const repository = await createRepository();
  const service = new MedicalServiceService(repository);
  const controller = new MedicalServiceController(service);
  const router = createRouter({ controller, config });

  return async function app(request: IncomingMessage, response: ServerResponse): Promise<void> {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    response.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS"
    );

    try {
      await router(request, response);
    } catch (error) {
      sendError(response, error as Error);
    }
  };
}
