import type { IncomingMessage, ServerResponse } from "node:http";
import type { RequestContext, ServiceConfig } from "../types.ts";
import { MedicalServiceController } from "../controllers/medicalServiceController.ts";
import { HttpError, normalizePath } from "../utils/http.ts";

interface RouteDefinition {
  method: string;
  pattern: string;
  action: (request: RequestContext, response: ServerResponse) => void | Promise<void>;
}

function buildRequestContext(request: IncomingMessage, config: ServiceConfig): RequestContext {
  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
  const pathname = normalizePath(url.pathname);

  return {
    method: request.method,
    pathname,
    query: Object.fromEntries(url.searchParams.entries()),
    raw: request,
    params: {},
    config
  };
}

function matchesPattern(pathname: string, pattern: string): Record<string, string> | null {
  const currentSegments = pathname.split("/").filter(Boolean);
  const patternSegments = pattern.split("/").filter(Boolean);

  if (currentSegments.length !== patternSegments.length) {
    return null;
  }

  const params: Record<string, string> = {};

  for (let index = 0; index < patternSegments.length; index += 1) {
    const patternSegment = patternSegments[index];
    const currentSegment = currentSegments[index];

    if (patternSegment.startsWith(":")) {
      params[patternSegment.slice(1)] = decodeURIComponent(currentSegment);
      continue;
    }

    if (patternSegment !== currentSegment) {
      return null;
    }
  }

  return params;
}

export function createRouter({
  controller,
  config
}: {
  controller: MedicalServiceController;
  config: ServiceConfig;
}) {
  const routes: RouteDefinition[] = [
    { method: "GET", pattern: "/health", action: (req, res) => controller.health(req, res, config) },
    {
      method: "GET",
      pattern: `${config.apiPrefix}/medical-services/code/:code`,
      action: (req, res) => controller.getByCode(req, res)
    },
    {
      method: "GET",
      pattern: `${config.apiPrefix}/medical-services`,
      action: (req, res) => controller.list(req, res)
    },
    {
      method: "GET",
      pattern: `${config.apiPrefix}/medical-services/:id`,
      action: (req, res) => controller.getById(req, res)
    },
    {
      method: "POST",
      pattern: `${config.apiPrefix}/medical-services`,
      action: (req, res) => controller.create(req, res)
    },
    {
      method: "PUT",
      pattern: `${config.apiPrefix}/medical-services/:id`,
      action: (req, res) => controller.replace(req, res)
    },
    {
      method: "PATCH",
      pattern: `${config.apiPrefix}/medical-services/:id/status`,
      action: (req, res) => controller.updateStatus(req, res)
    },
    {
      method: "DELETE",
      pattern: `${config.apiPrefix}/medical-services/:id`,
      action: (req, res) => controller.delete(req, res)
    }
  ];

  return async function router(request: IncomingMessage, response: ServerResponse): Promise<void> {
    const context = buildRequestContext(request, config);

    if (context.method === "OPTIONS") {
      response.writeHead(204, {
        Allow: "GET,POST,PUT,PATCH,DELETE,OPTIONS"
      });
      response.end();
      return;
    }

    for (const route of routes) {
      if (route.method !== context.method) {
        continue;
      }

      const params = matchesPattern(context.pathname, route.pattern);

      if (!params) {
        continue;
      }

      context.params = params;
      await route.action(context, response);
      return;
    }

    throw new HttpError(404, "ROUTE_NOT_FOUND", "La ruta solicitada no existe.");
  };
}
