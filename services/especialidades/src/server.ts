import http from "node:http";
import { createApp } from "./app.ts";
import { getConfig } from "./config/env.ts";
import { specialtyRepository } from "./repositories/specialtyRepository.ts";

const config = getConfig();

let server: http.Server;

async function bootstrap(): Promise<http.Server> {
  await specialtyRepository.initialize();

  const handler = createApp();
  const createdServer = http.createServer(handler);

  await new Promise<void>((resolve) => {
    createdServer.listen(config.port, config.host, () => {
      console.log(
        `[${config.serviceName}] escuchando en http://${config.host}:${config.port}${config.apiPrefix}`
      );
      resolve();
    });
  });

  server = createdServer;
  return createdServer;
}

await bootstrap();

export { server, bootstrap };