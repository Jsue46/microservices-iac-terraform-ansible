# API Gateway

Este gateway usa Nginx como reverse proxy y enruta las APIs de los microservicios.

## Rutas expuestas por el gateway

- `GET /health` -> health del gateway
- `GET /health/servicios-medicos` -> health del microservicio de servicios medicos
- `GET /health/especialidades` -> health del microservicio de especialidades
- `/api/v1/medical-services` -> microservicio `servicios-medicos:3001`
- `/api/v1/especialidades` -> microservicio `especialidades:3002`

## Levantar todo con Docker Compose

Desde la raiz del proyecto:

```bash
docker compose up --build -d
```

Gateway publico local:

- `http://localhost:8080`

## Pruebas rapidas

Health del gateway:

```bash
curl http://localhost:8080/health
```

Health del microservicio de servicios medicos (a traves del gateway):

```bash
curl http://localhost:8080/health/servicios-medicos
```

Listar servicios medicos:

```bash
curl "http://localhost:8080/api/v1/medical-services?page=1&pageSize=10"
```

Listar especialidades:

```bash
curl http://localhost:8080/api/v1/especialidades
```

## Notas

- El gateway conserva codigos HTTP y payload JSON de los microservicios.
- `OPTIONS`, `GET`, `POST`, `PUT`, `PATCH` y `DELETE` pasan por proxy sin transformacion.
- Si luego cambias puertos o nombres de servicios en Compose, actualiza `gateway/nginx.conf`.
