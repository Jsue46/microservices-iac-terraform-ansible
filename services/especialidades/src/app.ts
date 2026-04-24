import type { IncomingMessage, ServerResponse } from "node:http";
import { specialtyRouter } from "./routes/specialtyRouter.ts";
import { sendJson, sendError } from "./utils/http.ts";
import { getConfig } from "./config/env.ts";

export function createApp(): (req: IncomingMessage, res: ServerResponse) => void {
  const config = getConfig();

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

    const handled = specialtyRouter(req, res, pathname);
    if (!handled) {
      sendError(res, 404, "NOT_FOUND", "Ruta no encontrada.");
    }
  };
}