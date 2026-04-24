# Microservicio de Servicios Medicos

## Descripcion

Este microservicio administra el catalogo de servicios y procedimientos medicos de la
plataforma. Su responsabilidad principal es exponer endpoints para consultar, crear,
actualizar y eliminar servicios medicos individuales, incluyendo nombre, descripcion,
precio, disponibilidad y requisitos previos.

La implementacion soporta dos modos de persistencia:

- `memory`: pensado para desarrollo local y pruebas rapidas.
- `postgres`: pensado para despliegue e integracion con una base de datos gestionada.

De esta forma el microservicio puede ejecutarse localmente sin dependencias externas,
pero tambien queda preparado para la arquitectura final solicitada por el enunciado.

## Responsabilidad dentro del proyecto

Este componente cubre especificamente:

- Codigo del microservicio de Servicios Medicos.
- Contrato HTTP para integracion con gateway, frontend y otros microservicios.
- Contenedor Docker para despliegue del servicio.
- Tipado con TypeScript para mejorar claridad, mantenimiento e integracion.

No incluye frontend ni logica del microservicio de Especialidades.

## Documentacion complementaria

- [Integracion con API Gateway](./INTEGRACION_GATEWAY.md)
- [Modelo de datos](./docs/modelo-datos.md)

## Estructura interna

```text
services/servicios-medicos/
|-- src/
|   |-- config/
|   |   `-- env.ts
|   |-- controllers/
|   |   `-- medicalServiceController.ts
|   |-- data/
|   |   `-- medicalServicesSeed.ts
|   |-- repositories/
|   |   `-- medicalServiceRepository.ts
|   |-- routes/
|   |   `-- medicalServiceRouter.ts
|   |-- services/
|   |   `-- medicalServiceService.ts
|   |-- types.ts
|   |-- utils/
|   |   `-- http.ts
|   |-- app.ts
|   `-- server.ts
|-- tests/
|   `-- run-smoke-tests.ts
|-- .dockerignore
|-- Dockerfile
|-- package.json
|-- tsconfig.json
`-- README.md
```

## Variables de entorno

| Variable | Descripcion | Valor por defecto |
|---|---|---|
| `PORT` | Puerto HTTP del microservicio | `3001` |
| `HOST` | Host donde escucha el servidor | `0.0.0.0` |
| `SERVICE_NAME` | Nombre logico del servicio | `servicios-medicos` |
| `API_PREFIX` | Prefijo base de la API | `/api/v1` |
| `PERSISTENCE_MODE` | Modo de persistencia: `memory` o `postgres` | `memory` |
| `DATABASE_URL` | Cadena de conexion PostgreSQL | No aplica |
| `DATABASE_SSL` | Define si la conexion PostgreSQL usa SSL | `false` |
| `DATABASE_SCHEMA` | Esquema de base de datos a utilizar | `public` |

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

La ejecucion aprovecha el soporte nativo de TypeScript disponible en Node.js 22, por lo
que el microservicio puede correrse directamente sin agregar una etapa extra de
transpilacion en esta fase.

### Modos de arranque

Desarrollo local en memoria:

```bash
npm start
```

Despliegue con PostgreSQL:

```bash
PERSISTENCE_MODE=postgres DATABASE_URL=postgresql://usuario:clave@host:5432/servicios_medicos npm start
```

## Docker

Construccion de imagen:

```bash
docker build -t servicios-medicos ./services/servicios-medicos
```

Ejecucion del contenedor:

```bash
docker run --rm -p 3001:3001 --name servicios-medicos servicios-medicos
```

Con variables de entorno:

```bash
docker run --rm -p 3001:3001 -e PORT=3001 -e HOST=0.0.0.0 servicios-medicos
```

Con base de datos PostgreSQL:

```bash
docker run --rm -p 3001:3001 \
  -e PERSISTENCE_MODE=postgres \
  -e DATABASE_URL=postgresql://usuario:clave@host:5432/servicios_medicos \
  -e DATABASE_SSL=false \
  servicios-medicos
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
      "price debe ser un numero mayor o igual a 0"
    ]
  }
}
```

## Modelo de servicio medico

### Objeto que devuelve la API

```json
{
  "id": "svc-001",
  "code": "CONS-CARD-001",
  "name": "Consulta cardiologica integral",
  "shortDescription": "Consulta especializada para evaluacion cardiovascular.",
  "technicalDescription": "Incluye anamnesis, examen fisico y valoracion de riesgo cardiovascular.",
  "price": 450,
  "currency": "GTQ",
  "availabilityStatus": "available",
  "isActive": true,
  "durationMinutes": 45,
  "preparationRequirements": [
    "Presentar resultados previos si aplica"
  ],
  "specialtyIds": [
    "cardiologia"
  ],
  "tags": [
    "consulta",
    "corazon"
  ],
  "createdAt": "2026-04-23T00:00:00.000Z",
  "updatedAt": "2026-04-23T00:00:00.000Z"
}
```

### Campos del modelo

| Campo | Tipo | Requerido | Descripcion |
|---|---|---|---|
| `id` | `string` | Respuesta | Identificador unico interno del servicio |
| `code` | `string` | No en creacion | Codigo funcional unico; si no se envia se genera |
| `name` | `string` | Si | Nombre comercial del servicio medico |
| `shortDescription` | `string` | Si | Descripcion resumida para listados |
| `technicalDescription` | `string` | Si | Descripcion tecnica del procedimiento |
| `price` | `number` | Si | Precio del servicio |
| `currency` | `string` | No | Moneda; por defecto `GTQ` |
| `availabilityStatus` | `string` | No | `available`, `limited`, `unavailable` |
| `isActive` | `boolean` | No | Indica si el servicio sigue vigente |
| `durationMinutes` | `number` | No | Duracion estimada en minutos |
| `preparationRequirements` | `string[]` | No | Lista de requisitos previos |
| `specialtyIds` | `string[]` | No | Referencias a especialidades relacionadas |
| `tags` | `string[]` | No | Etiquetas libres para filtros |
| `createdAt` | `string` | Respuesta | Fecha ISO de creacion |
| `updatedAt` | `string` | Respuesta | Fecha ISO de ultima actualizacion |

## Endpoints disponibles

### 1. Health check

`GET /health`

Respuesta:

```json
{
  "success": true,
  "data": {
    "service": "servicios-medicos",
    "status": "ok",
    "timestamp": "2026-04-23T00:00:00.000Z"
  }
}
```

### 2. Listar servicios medicos

`GET /api/v1/medical-services`

#### Query params soportados

| Parametro | Tipo | Descripcion |
|---|---|---|
| `search` | `string` | Busca por nombre, descripcion corta, tecnica o codigo |
| `specialtyId` | `string` | Filtra por especialidad relacionada |
| `status` | `string` | Filtra por `available`, `limited`, `unavailable` |
| `available` | `boolean` | `true` devuelve activos y disponibles |
| `minPrice` | `number` | Precio minimo |
| `maxPrice` | `number` | Precio maximo |
| `sortBy` | `string` | `name`, `price`, `createdAt`, `updatedAt` |
| `sortOrder` | `string` | `asc` o `desc` |
| `page` | `number` | Pagina solicitada |
| `pageSize` | `number` | Tamano de pagina, maximo 100 |

#### Ejemplo de respuesta

```json
{
  "success": true,
  "data": [
    {
      "id": "svc-001",
      "code": "CONS-CARD-001",
      "name": "Consulta cardiologica integral",
      "shortDescription": "Consulta especializada para evaluacion cardiovascular.",
      "technicalDescription": "Incluye anamnesis, examen fisico y valoracion de riesgo cardiovascular.",
      "price": 450,
      "currency": "GTQ",
      "availabilityStatus": "available",
      "isActive": true,
      "durationMinutes": 45,
      "preparationRequirements": [
        "Presentar resultados previos si aplica"
      ],
      "specialtyIds": [
        "cardiologia"
      ],
      "tags": [
        "consulta",
        "corazon"
      ],
      "createdAt": "2026-04-23T00:00:00.000Z",
      "updatedAt": "2026-04-23T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 10,
    "totalItems": 6,
    "totalPages": 1,
    "filters": {
      "search": null,
      "specialtyId": null,
      "status": null,
      "available": null,
      "minPrice": null,
      "maxPrice": null,
      "sortBy": "name",
      "sortOrder": "asc"
    }
  }
}
```

### 3. Obtener servicio por id

`GET /api/v1/medical-services/:id`

Respuesta:

```json
{
  "success": true,
  "data": {
    "id": "svc-001",
    "code": "CONS-CARD-001",
    "name": "Consulta cardiologica integral"
  }
}
```

### 4. Obtener servicio por codigo

`GET /api/v1/medical-services/code/:code`

Uso recomendado para integraciones cuando otros componentes manejen codigo funcional en
vez de `id`.

### 5. Crear servicio medico

`POST /api/v1/medical-services`

#### Body esperado

```json
{
  "name": "Electrocardiograma en reposo",
  "shortDescription": "Estudio cardiaco no invasivo para actividad electrica del corazon.",
  "technicalDescription": "Registro de doce derivaciones con toma estandar y validacion medica.",
  "price": 275,
  "currency": "GTQ",
  "availabilityStatus": "available",
  "isActive": true,
  "durationMinutes": 20,
  "preparationRequirements": [
    "No aplicar crema en el pecho el dia del estudio"
  ],
  "specialtyIds": [
    "cardiologia"
  ],
  "tags": [
    "diagnostico",
    "corazon"
  ]
}
```

#### Respuesta

```json
{
  "success": true,
  "data": {
    "id": "svc-007",
    "code": "ELECTROCARDIOGRAMA-EN-REPOSO",
    "name": "Electrocardiograma en reposo"
  }
}
```

### 6. Reemplazar servicio completo

`PUT /api/v1/medical-services/:id`

Requiere el objeto completo del servicio, excepto `id`, `createdAt` y `updatedAt`.

### 7. Actualizar estado del servicio

`PATCH /api/v1/medical-services/:id/status`

#### Body esperado

```json
{
  "availabilityStatus": "limited",
  "isActive": true
}
```

### 8. Eliminar servicio medico

`DELETE /api/v1/medical-services/:id`

Respuesta:

```json
{
  "success": true,
  "data": {
    "message": "Servicio medico eliminado correctamente."
  }
}
```

## Reglas de validacion

- `name`, `shortDescription` y `technicalDescription` son obligatorios.
- `price` debe ser un numero mayor o igual a `0`.
- `availabilityStatus` solo admite `available`, `limited` o `unavailable`.
- `durationMinutes`, si se envia, debe ser un entero positivo.
- `preparationRequirements`, `specialtyIds` y `tags` deben ser arreglos de cadenas.
- `code` debe ser unico en el microservicio.

## Recomendaciones para integracion con el resto del equipo

- El gateway puede consumir este microservicio usando el prefijo base
  `/api/v1/medical-services`.
- El frontend puede usar el endpoint de listado y aplicar filtros por `specialtyId`.
- El microservicio de Especialidades puede enlazar sus registros utilizando `id` o
  `code`, aunque para interoperabilidad estable se recomienda `code`.
- Mientras no exista base de datos, los datos son reiniciados cada vez que el servicio
  se reinicia.

## Persistencia y despliegue final

Segun el enunciado de la practica, cada microservicio debe quedar preparado para usar
una base de datos desacoplada y gestionada. Por esa razon este microservicio ya incluye
soporte para PostgreSQL mediante variables de entorno.

### Comportamiento por modo

- `PERSISTENCE_MODE=memory`: usa datos semilla en memoria. Es util para desarrollo y
  pruebas locales.
- `PERSISTENCE_MODE=postgres`: crea conexion a PostgreSQL y asegura la existencia de la
  tabla `medical_services` al iniciar.

### Tabla utilizada en PostgreSQL

La implementacion crea y utiliza la tabla:

- `${DATABASE_SCHEMA}.medical_services`

Esta tabla almacena:

- Identificador del servicio
- Codigo unico
- Nombre
- Descripcion corta
- Descripcion tecnica
- Precio y moneda
- Estado de disponibilidad
- Indicador de vigencia
- Duracion
- Requisitos previos
- Especialidades relacionadas
- Etiquetas
- Fechas de creacion y actualizacion

### Estado actual para despliegue

Con el codigo actual:

- El microservicio ya puede desplegarse directamente en modo `memory`.
- Tambien puede desplegarse en modo `postgres` si Terraform o Ansible inyectan
  `DATABASE_URL` y el acceso de red a la base de datos.
- No depende de un archivo `.env` obligatorio; en nube las variables pueden inyectarse
  desde el entorno del contenedor o desde la configuracion del despliegue.
