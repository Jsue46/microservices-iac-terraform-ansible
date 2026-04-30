# AYD2_A_2S2026_PRAC2_G6

## Practica 2 - Infraestructura como Codigo

**Curso:** Analisis y Diseno de Sistemas 2  
**Seccion:** A  
**Semestre:** 2S 2026  
**Grupo:** 6  
**Facultad:** Ingenieria  
**Universidad:** Universidad de San Carlos de Guatemala

## Integrantes

| No. | Integrante | Carnet |
|---|---|---|
| 1 | Angel Guillermo Arreaga Barrientos | 202004762 |
| 2 | Estuardo Josue Vaquiax Reyes | 202201336 |
| 3 | Hector Daniel Ortiz Osorio | 202203806 |
| 4 | Juan Pascual Itzep Coguox | 202202161 |
| 5 | Sergio Sebastian Sandoval Ruiz | 202010298 |

## Resumen

Este repositorio contiene la solucion de la practica enfocada en una plataforma web
para catalogo de servicios medicos, implementada con arquitectura de microservicios,
API Gateway, frontend web y automatizacion de despliegue con Terraform y Ansible.

Actualmente el proyecto incluye:

- `frontend` con interfaz para consultar servicios y especialidades.
- `gateway` como punto de entrada unico para las APIs.
- `services/servicios-medicos` con soporte de persistencia en memoria o PostgreSQL.
- `services/especialidades` con soporte de persistencia en memoria o PostgreSQL.
- `infra/terraform` para red, VMs y Cloud SQL en GCP.
- `infra/ansible` para despliegue de contenedores e inyeccion de configuracion.

## Estructura

```text
AYD2_A_2S2026_PRAC2_G6/
|-- docs/
|-- frontend/
|-- gateway/
|-- infra/
|   |-- ansible/
|   `-- terraform/
|-- reference/
|-- services/
|   |-- especialidades/
|   `-- servicios-medicos/
|-- docker-compose.yml
`-- README.md
```

## Estado actual

La solucion ya cuenta con implementacion funcional de frontend, gateway,
microservicios, contenedores, documentacion tecnica y automatizacion de despliegue.
La configuracion de `frontend` y `gateway` fue ajustada para no depender de IPs
hardcodeadas dentro de las imagenes.

## Documentacion principal

- [Arquitectura de despliegue](./docs/arquitectura-despliegue.md)
- [Manual de usuario](./docs/manual-usuario.md)
- [Microservicio de Servicios Medicos](./services/servicios-medicos/README.md)
- [Microservicio de Especialidades](./services/especialidades/README.md)
- [Terraform en GCP](./infra/terraform/README.md)

## Convencion de commits

```text
#carnet: mensaje
```
