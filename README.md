# AYD2_A_2S2026_PRAC2_G6

## Practica 2 - Infraestructura como Codigo

**Curso:** Analisis y Diseno de Sistemas 2  
**Seccion:** A  
**Semestre:** 2S 2026  
**Grupo:** 6  
**Facultad:** Ingenieria  
**Universidad:** Universidad de San Carlos de Guatemala

---

## Integrantes

| No. | Integrante | Carnet |
|---|---|---|
| 1 | Angel Guillermo Arreaga Barrientos | 202004762 |
| 2 | Estuardo Josue Vaquiax Reyes | 202201336 |
| 3 | Hector Daniel Ortiz Osorio | 202203806 |
| 4 | Juan Pascual Itzep Coguox | 202202161 |
| 5 | Sergio Sebastian Sandoval Ruiz | 202010298 |

---

## Descripcion

Este repositorio contiene el desarrollo de la Practica 2 del curso Analisis y Diseno de
Sistemas 2. La practica consiste en construir una plataforma web para la gestion de
servicios medicos, utilizando una arquitectura basada en microservicios y un enfoque de
Infraestructura como Codigo con Terraform y Ansible.

La solucion contempla un frontend, un gateway como punto de entrada, dos
microservicios principales y la automatizacion del despliegue en nube.

---

## Objetivo del repositorio

Centralizar en un solo proyecto:

- El codigo fuente del frontend y de los microservicios.
- La configuracion del gateway.
- La infraestructura definida con Terraform.
- La automatizacion de configuracion y despliegue con Ansible.
- La documentacion solicitada por el enunciado.

---

## Estructura actual del proyecto

```text
AYD2_A_2S2026_PRAC2_G6/
|-- docs/
|   |-- arquitectura-despliegue.md
|   |-- enunciado_extraido.txt
|   `-- manual-usuario.md
|-- frontend/
|   |-- src/
|   |   |-- app.js
|   |   `-- index.html
|   |-- Dockerfile
|   `-- nginx.conf
|-- gateway/
|   |-- Dockerfile
|   `-- nginx.conf
|-- infra/
|   |-- ansible/
|   |   |-- ansible.cfg
|   |   |-- inventory.ini
|   |   `-- playbook.yml
|   `-- terraform/
|       |-- main.tf
|       |-- outputs.tf
|       |-- providers.tf
|       `-- variables.tf
|-- services/
|   |-- especialidades/
|   |   |-- src/
|   |   |   `-- server.js
|   |   |-- Dockerfile
|   |   `-- package.json
|   `-- servicios-medicos/
|       |-- src/
|       |   `-- server.js
|       |-- Dockerfile
|       `-- package.json
|-- docker-compose.yml
`-- README.md
```

---

## Correspondencia con el enunciado

- `frontend/`: interfaz web para consultar especialidades y servicios medicos.
- `gateway/`: punto de entrada al sistema y capa de enrutamiento.
- `services/servicios-medicos/`: microservicio encargado del catalogo de servicios.
- `services/especialidades/`: microservicio encargado del catalogo de especialidades.
- `infra/terraform/`: aprovisionamiento de infraestructura en nube.
- `infra/ansible/`: configuracion del entorno y despliegue automatizado.
- `docs/`: documentacion tecnica y manuales requeridos en la practica.

---

## Estado actual

El repositorio se encuentra en fase de estructura base. La organizacion de carpetas ya
responde a los componentes principales del enunciado y servira como esqueleto para la
implementacion del sistema, la infraestructura y la documentacion final.

---

## Documentacion principal

- [Arquitectura de despliegue](./docs/arquitectura-despliegue.md)
- [Manual de usuario](./docs/manual-usuario.md)

- [FASE_2/frontend/README.md](./FASE_2/frontend/README.md)

---

## Convencion de commits

```text
#carnet: mensaje
```
