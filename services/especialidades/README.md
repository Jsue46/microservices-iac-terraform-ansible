# Microservicio de Especialidades

## Descripcion

Este microservicio administra el catalogo de especialidades medicas de la plataforma.
Su responsabilidad principal es exponer endpoints para consultar, crear, actualizar y
eliminar especialidades, incluyendo nombre, descripcion, estado y referencias a los
servicios medicos que agrupa.

La implementacion usa persistencia en memoria, lo que permite ejecutarse localmente
sin dependencias externas y quedar listo para integracion con el resto de la
arquitectura.

## Responsabilidad dentro del proyecto

Este componente cubre especificamente:

- Codigo del microservicio de Especialidades.
- Contrato HTTP para integracion con gateway, frontend y microservicio de Servicios Medicos.
- Contenedor Docker para despliegue del servicio.
- Tipado con TypeScript para claridad, mantenimiento e integracion.

No incluye frontend ni logica del microservicio de Servicios Medicos.

## Documentacion complementaria

- [Modelo de datos](./docs/modelo-datos.md)

## Estructura interna

```text
services/especialidades/
|-- src/
|   |-- config/
|   |   `-- env.ts
|   |-- controllers/
|   |   `-- specialtyController.ts
|   |-- data/
|   |   `-- specialtiesSeed.ts
|   |-- repositories/
|   |   `-- specialtyRepository.ts
|   |-- routes/
|   |   `-- specialtyRouter.ts
|   |-- services/
|   |   `-- specialtyService.ts
|   |-- types.ts
|   |-- utils/
|   |   `-- http.ts
|   |-- app.ts
|   `-- server.ts
|-- tests/
|   `-- run-smoke-tests.ts
|-- docs/
|   `-- modelo-datos.md
|-- .dockerignore
|-- .env.example
|-- Dockerfile
|-- package.json
|-- tsconfig.json
`-- README.md
```

## Variables de entorno

| Variable | Descripcion | Valor por defecto |
|---|---|---|
| `PORT` | Puerto HTTP del microservicio | `3002` |
| `HOST` | Host donde escucha el servidor | `0.0.0.0` |
| `SERVICE_NAME` | Nombre logico del servicio | `especialidades` |
| `API_PREFIX` | Prefijo base de la API | `/api/v1` |

Archivo de ejemplo:

```bash
cp .env.example .env
```

## Ejecucion local

Desde la carpeta del microservicio:

```bash
npm start
```

Modo desarrollo:

```bash
npm run dev
```

Pruebas:

```bash
npm test
```

La ejecucion aprovecha el soporte nativo de TypeScript disponible en Node.js 22 con el
flag `--experimental-strip-types`, por lo que el microservicio corre directamente sin
una etapa de transpilacion.

## Docker

Construccion de imagen:

```bash
docker build -t especialidades ./services/especialidades
```

Ejecucion del contenedor:

```bash
docker run --rm -p 3002:3002 --name especialidades especialidades
```

Con variables de entorno:

```bash
docker run --rm -p 3002:3002 -e PORT=3002 -e HOST=0.0.0.0 especialidades
```

## Contrato HTTP

### Formato general de respuesta exitosa

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

### Formato general de error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "La solicitud contiene datos invalidos.",
    "details": [
      "name es requerido"
    ]
  }
}
```

## Modelo de especialidad

### Objeto que devuelve la API

```json
{
  "id": "cardiologia",
  "code": "CARD-001",
  "name": "Cardiologia",
  "description": "Especialidad medica enfocada en el diagnostico y tratamiento de enfermedades del corazon.",
  "isActive": true,
  "serviceIds": ["svc-001", "svc-002"],
  "createdAt": "2026-04-24T00:00:00.000Z",
  "updatedAt": "2026-04-24T00:00:00.000Z"
}
```

### Campos del modelo

| Campo | Tipo | Requerido | Descripcion |
|---|---|---|---|
| `id` | `string` | Respuesta | Identificador unico de la especialidad |
| `code` | `string` | No en creacion | Codigo unico; si no se envia se genera del nombre |
| `name` | `string` | Si | Nombre de la especialidad |
| `description` | `string` | No | Descripcion general de la especialidad |
| `isActive` | `boolean` | No | Indica si la especialidad esta activa |
| `serviceIds` | `string[]` | No | IDs de servicios medicos asociados |
| `createdAt` | `string` | Respuesta | Fecha ISO de creacion |
| `updatedAt` | `string` | Respuesta | Fecha ISO de ultima actualizacion |

## Endpoints disponibles

### 1. Health check

`GET /health`

```json
{
  "success": true,
  "data": {
    "service": "especialidades",
    "status": "ok",
    "timestamp": "2026-04-24T00:00:00.000Z"
  }
}
```

### 2. Listar especialidades

`GET /api/v1/especialidades`

```json
{
  "success": true,
  "data": [...],
  "meta": { "total": 4 }
}
```

### 3. Obtener especialidad por id

`GET /api/v1/especialidades/:id`

### 4. Crear especialidad

`POST /api/v1/especialidades`

```json
{
  "name": "Neurologia",
  "description": "Especialidad del sistema nervioso.",
  "isActive": true,
  "serviceIds": []
}
```

### 5. Reemplazar especialidad

`PUT /api/v1/especialidades/:id`

Requiere el objeto completo excepto `id`, `createdAt` y `updatedAt`.

### 6. Eliminar especialidad

`DELETE /api/v1/especialidades/:id`

```json
{
  "success": true,
  "data": { "message": "Especialidad eliminada correctamente." }
}
```

## Reglas de validacion

- `name` es obligatorio.
- `serviceIds`, si se envia, debe ser un arreglo de cadenas.
- `isActive`, si se envia, debe ser booleano.

## Recomendaciones para integracion con el resto del equipo

- El gateway puede consumir este microservicio usando el prefijo `/api/v1/especialidades`.
- El frontend puede listar especialidades y usarlas para filtrar servicios medicos por `specialtyId`.
- El microservicio de Servicios Medicos usa los `id` de las especialidades en su campo `specialtyIds`.
- Los datos semilla de ambos microservicios estan sincronizados por `id`.
- Mientras no exista base de datos, los datos se reinician al reiniciar el servicio.