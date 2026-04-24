import type { IncomingMessage, ServerResponse } from "node:http";
import { specialtyController } from "../controllers/specialtyController.ts";

export function specialtyRouter(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string
): boolean {
  if (!pathname.startsWith("/api/v1/especialidades")) return false;

  const withId = pathname.match(/^\/api\/v1\/especialidades\/([^/]+)$/);

  if (req.method === "GET" && pathname === "/api/v1/especialidades") {
    specialtyController.list(req, res);
    return true;
  }

  if (req.method === "POST" && pathname === "/api/v1/especialidades") {
    specialtyController.create(req, res);
    return true;
  }

  if (withId) {
    const id = withId[1];
    if (req.method === "GET")    { specialtyController.getById(req, res, id); return true; }
    if (req.method === "PUT")    { specialtyController.replace(req, res, id); return true; }
    if (req.method === "DELETE") { specialtyController.remove(req, res, id);  return true; }
  }

  return false;
}