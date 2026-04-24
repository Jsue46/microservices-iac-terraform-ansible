import assert from "node:assert/strict";
import http from "node:http";
import { once } from "node:events";
import { createApp } from "../src/app.ts";

async function startTestServer(): Promise<{ server: http.Server; baseUrl: string }> {
  const app = await createApp();
  const server = http.createServer(app);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();

  if (!address || typeof address === "string") {
    throw new Error("No fue posible obtener la direccion del servidor de prueba.");
  }

  return {
    server,
    baseUrl: `http://127.0.0.1:${address.port}`
  };
}

async function run(): Promise<void> {
  const { server, baseUrl } = await startTestServer();

  try {
    const healthResponse = await fetch(`${baseUrl}/health`);
    const healthPayload = await healthResponse.json() as {
      success: boolean;
      data: { status: string };
    };
    assert.equal(healthResponse.status, 200);
    assert.equal(healthPayload.success, true);
    assert.equal(healthPayload.data.status, "ok");

    const listResponse = await fetch(
      `${baseUrl}/api/v1/medical-services?page=1&pageSize=2`
    );
    const listPayload = await listResponse.json() as {
      data: unknown[];
      meta: { page: number };
    };
    assert.equal(listResponse.status, 200);
    assert.equal(Array.isArray(listPayload.data), true);
    assert.equal(listPayload.data.length, 2);
    assert.equal(listPayload.meta.page, 1);

    const createResponse = await fetch(`${baseUrl}/api/v1/medical-services`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: "Ultrasonido abdominal completo",
        shortDescription: "Estudio de imagen para evaluacion abdominal general.",
        technicalDescription:
          "Exploracion ecografica completa de higado, vesicula, pancreas, bazo y rinones.",
        price: 525,
        specialtyIds: ["radiologia"],
        preparationRequirements: ["Ayuno de 6 horas"],
        tags: ["imagen", "abdomen"]
      })
    });
    const createdPayload = await createResponse.json() as {
      success: boolean;
      data: { name: string; code: string };
    };
    assert.equal(createResponse.status, 201);
    assert.equal(createdPayload.success, true);
    assert.equal(createdPayload.data.name, "Ultrasonido abdominal completo");
    assert.equal(createdPayload.data.code, "ULTRASONIDO-ABDOMINAL-COMPLETO");

    const patchResponse = await fetch(`${baseUrl}/api/v1/medical-services/svc-001/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        availabilityStatus: "limited",
        isActive: true
      })
    });
    const patchPayload = await patchResponse.json() as {
      data: { availabilityStatus: string };
    };
    assert.equal(patchResponse.status, 200);
    assert.equal(patchPayload.data.availabilityStatus, "limited");

    console.log("Smoke tests completados correctamente.");
  } finally {
    server.close();
  }
}

run().catch((error: unknown) => {
  console.error("Fallo en smoke tests:", error);
  process.exitCode = 1;
});
