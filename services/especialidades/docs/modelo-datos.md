# Modelo de Datos del Microservicio de Especialidades

## Descripcion

Este documento resume el modelo de datos del microservicio de Especialidades para
su capa de persistencia en memoria, con estructura preparada para una futura
integracion con base de datos desacoplada.

## Tabla logica

- `especialidades`

## Estructura del registro

| Campo | Tipo | Descripcion |
|---|---|---|
| `id` | `string` | Identificador unico de la especialidad |
| `code` | `string` | Codigo funcional unico generado automaticamente |
| `name` | `string` | Nombre de la especialidad (ej. Cardiologia) |
| `description` | `string` | Descripcion general de la especialidad |
| `isActive` | `boolean` | Indica si la especialidad esta activa |
| `serviceIds` | `string[]` | IDs de servicios medicos asociados a esta especialidad |
| `createdAt` | `string` | Fecha ISO de creacion |
| `updatedAt` | `string` | Fecha ISO de ultima actualizacion |

## Relacion con el microservicio de Servicios Medicos

El campo `serviceIds` contiene referencias a los `id` del microservicio de
Servicios Medicos. Esta relacion es unidireccional: la especialidad conoce sus
servicios, pero cada servicio medico tambien mantiene su propio campo `specialtyIds`
apuntando de regreso a la especialidad.

Ejemplo de relacion:

```
Especialidad cardiologia
  serviceIds: ["svc-001", "svc-002"]

Servicio svc-001
  specialtyIds: ["cardiologia"]
```

## Datos semilla

El microservicio inicia con 4 especialidades predefinidas:

| id | code | name |
|---|---|---|
| `cardiologia` | `CARD-001` | Cardiologia |
| `pediatria` | `PED-001` | Pediatria |
| `laboratorio-clinico` | `LAB-001` | Laboratorio Clinico |
| `radiologia` | `RAD-001` | Radiologia |

## Notas importantes

- La persistencia actual es en memoria; los datos se reinician al reiniciar el servicio.
- El microservicio no requiere base de datos externa para ejecutarse.
- Los `id` de las especialidades semilla coinciden con los `specialtyIds` usados
  en los datos semilla del microservicio de Servicios Medicos.