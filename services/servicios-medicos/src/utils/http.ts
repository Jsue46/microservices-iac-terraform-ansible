import type { IncomingMessage, ServerResponse } from "node:http";

const JSON_CONTENT_TYPE = "application/json; charset=utf-8";

export class HttpError extends Error {
  statusCode: number;
  code: string;
  details: string[];

  constructor(statusCode: number, code: string, message: string, details: string[] = []) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function sendJson(
  response: ServerResponse,
  statusCode: number,
  payload: unknown
): void {
  response.writeHead(statusCode, {
    "Content-Type": JSON_CONTENT_TYPE
  });
  response.end(JSON.stringify(payload));
}

export function sendSuccess(
  response: ServerResponse,
  statusCode: number,
  data: unknown,
  meta?: unknown
): void {
  const payload: { success: true; data: unknown; meta?: unknown } = {
    success: true,
    data
  };

  if (meta !== undefined) {
    payload.meta = meta;
  }

  sendJson(response, statusCode, payload);
}

export function sendError(
  response: ServerResponse,
  error: Partial<HttpError> & { message?: string }
): void {
  const statusCode = error.statusCode || 500;
  const code = error.code || "INTERNAL_SERVER_ERROR";
  const message = error.message || "Ocurrio un error interno.";
  const details = Array.isArray(error.details) ? error.details : [];

  sendJson(response, statusCode, {
    success: false,
    error: {
      code,
      message,
      details
    }
  });
}

export function parseBoolean(value?: string): boolean | null {
  if (value === undefined) {
    return null;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return null;
}

export function parseNumber(value?: string): number | null {
  if (value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseInteger(value?: string): number | null {
  if (value === undefined || value === "") {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) ? parsed : null;
}

export function normalizePath(pathname?: string): string {
  if (!pathname) {
    return "/";
  }

  return pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

export function readJsonBody(request: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let rawBody = "";

    request.on("data", (chunk: Buffer) => {
      rawBody += chunk.toString();

      if (rawBody.length > 1_000_000) {
        reject(
          new HttpError(
            413,
            "PAYLOAD_TOO_LARGE",
            "El cuerpo de la solicitud excede el tamano permitido."
          )
        );
        request.destroy();
      }
    });

    request.on("end", () => {
      if (!rawBody.trim()) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(rawBody) as Record<string, unknown>);
      } catch {
        reject(
          new HttpError(
            400,
            "INVALID_JSON",
            "El cuerpo de la solicitud no contiene JSON valido."
          )
        );
      }
    });

    request.on("error", () => {
      reject(
        new HttpError(
          400,
          "REQUEST_READ_ERROR",
          "No fue posible leer la solicitud."
        )
      );
    });
  });
}
