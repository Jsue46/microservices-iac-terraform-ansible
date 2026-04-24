import http from "node:http";
import { createApp } from "./app.ts";
import { getConfig } from "./config/env.ts";

const config = getConfig();
let server: http.Server;

async function bootstrap(): Promise<http.Server> {
  const app = await createApp();
  const createdServer = http.createServer(app);

  await new Promise<void>((resolve) => {
    createdServer.listen(config.port, config.host, () => {
      console.log(
        `[${config.serviceName}] escuchando en http://${config.host}:${config.port}${config.apiPrefix} [mode=${config.persistenceMode}]`
      );
      resolve();
    });
  });

  server = createdServer;
  return createdServer;
}

await bootstrap();

export { server, bootstrap };
