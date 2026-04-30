import assert from "node:assert/strict";
import http from "node:http";
import { once } from "node:events";
import { createApp } from "../src/app.ts";

async function startTestServer(): Promise<{ server: http.Server; baseUrl: string }> {
  const handler = await createApp();
  const server = http.createServer(handler);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("No fue posible obtener la direccion del servidor de prueba.");
  }
  return {
    server,
    baseUrl: `http://127.0.0.1:${address.port}`,
  };
}

async function run(): Promise<void> {
  const { server, baseUrl } = await startTestServer();

  try {
    // 1. Health check
    const healthResponse = await fetch(`${baseUrl}/health`);
    const healthPayload = await healthResponse.json() as {
      success: boolean;
      data: { status: string };
    };
    assert.equal(healthResponse.status, 200);
    assert.equal(healthPayload.success, true);
    assert.equal(healthPayload.data.status, "ok");

    // 2. Listar especialidades
    const listResponse = await fetch(`${baseUrl}/api/v1/especialidades`);
    const listPayload = await listResponse.json() as {
      success: boolean;
      data: unknown[];
      meta: { total: number };
    };
    assert.equal(listResponse.status, 200);
    assert.equal(listPayload.success, true);
    assert.equal(Array.isArray(listPayload.data), true);
    assert.ok(listPayload.data.length > 0);

    // 3. Obtener especialidad por id
    const getResponse = await fetch(`${baseUrl}/api/v1/especialidades/cardiologia`);
    const getPayload = await getResponse.json() as {
      success: boolean;
      data: { id: string; name: string };
    };
    assert.equal(getResponse.status, 200);
    assert.equal(getPayload.success, true);
    assert.equal(getPayload.data.id, "cardiologia");

    // 4. Crear especialidad
    const createResponse = await fetch(`${baseUrl}/api/v1/especialidades`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Neurologia",
        description: "Especialidad dedicada al sistema nervioso central y periferico.",
        isActive: true,
        serviceIds: [],
      }),
    });
    const createdPayload = await createResponse.json() as {
      success: boolean;
      data: { id: string; name: string; code: string };
    };
    assert.equal(createResponse.status, 201);
    assert.equal(createdPayload.success, true);
    assert.equal(createdPayload.data.name, "Neurologia");
    assert.equal(createdPayload.data.code, "NEUROLOGIA");

    // 5. Actualizar especialidad (PUT)
    const createdId = (createdPayload.data as { id: string }).id;
    const putResponse = await fetch(`${baseUrl}/api/v1/especialidades/${createdId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Neurologia Clinica",
        description: "Especialidad dedicada al diagnostico y tratamiento del sistema nervioso.",
        isActive: true,
        serviceIds: [],
      }),
    });
    const putPayload = await putResponse.json() as {
      success: boolean;
      data: { name: string };
    };
    assert.equal(putResponse.status, 200);
    assert.equal(putPayload.success, true);
    assert.equal(putPayload.data.name, "Neurologia Clinica");

    // 6. Eliminar especialidad
    const deleteResponse = await fetch(`${baseUrl}/api/v1/especialidades/${createdId}`, {
      method: "DELETE",
    });
    const deletePayload = await deleteResponse.json() as { success: boolean };
    assert.equal(deleteResponse.status, 200);
    assert.equal(deletePayload.success, true);

    // 7. Verificar que ya no existe
    const notFoundResponse = await fetch(`${baseUrl}/api/v1/especialidades/${createdId}`);
    assert.equal(notFoundResponse.status, 404);

    console.log("Smoke tests completados correctamente.");
  } finally {
    server.close();
  }
}

run().catch((error: unknown) => {
  console.error("Fallo en smoke tests:", error);
  process.exitCode = 1;
});
