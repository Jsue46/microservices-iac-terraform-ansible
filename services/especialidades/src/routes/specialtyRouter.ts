import type { IncomingMessage, ServerResponse } from "node:http";
import { SpecialtyController } from "../controllers/specialtyController.ts";

export function specialtyRouter(
  controller: SpecialtyController,
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string
): boolean {
  if (!pathname.startsWith("/api/v1/especialidades")) return false;

  const withId = pathname.match(/^\/api\/v1\/especialidades\/([^/]+)$/);

  if (req.method === "GET" && pathname === "/api/v1/especialidades") {
    controller.list(req, res);
    return true;
  }

  if (req.method === "POST" && pathname === "/api/v1/especialidades") {
    controller.create(req, res);
    return true;
  }

  if (withId) {
    const id = withId[1];
    if (req.method === "GET")    { controller.getById(req, res, id); return true; }
    if (req.method === "PUT")    { controller.replace(req, res, id); return true; }
    if (req.method === "DELETE") { controller.remove(req, res, id);  return true; }
  }

  return false;
}
