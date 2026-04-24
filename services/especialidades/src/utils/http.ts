import type { ServerResponse } from "node:http";
import type { IncomingMessage } from "node:http";

export function sendJson(res: ServerResponse, statusCode: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

export function sendSuccess(res: ServerResponse, data: unknown, meta?: unknown): void {
  const body: Record<string, unknown> = { success: true, data };
  if (meta !== undefined) body.meta = meta;
  sendJson(res, 200, body);
}

export function sendCreated(res: ServerResponse, data: unknown): void {
  const payload = JSON.stringify({ success: true, data });
  res.writeHead(201, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

export function sendError(
  res: ServerResponse,
  statusCode: number,
  code: string,
  message: string,
  details: string[] = []
): void {
  sendJson(res, statusCode, {
    success: false,
    error: { code, message, details },
  });
}

export async function readBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}