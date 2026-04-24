# Arquitectura de Despliegue

## Descripcion general

La Practica 2 plantea una plataforma web para la consulta de servicios y
especialidades medicas, utilizando una arquitectura basada en microservicios y un
despliegue automatizado con Terraform y Ansible.

La estructura actual del repositorio es coherente con el enunciado, ya que separa los
componentes funcionales, el punto de entrada del sistema, la infraestructura y la
documentacion tecnica.

## Componentes principales

- `frontend`: interfaz web consumida por el usuario final.
- `gateway`: punto de entrada al sistema y capa de enrutamiento hacia los servicios.
- `services/servicios-medicos`: microservicio encargado del catalogo de servicios
  medicos.
- `services/especialidades`: microservicio encargado del catalogo de especialidades.
- `infra/terraform`: definicion de infraestructura como codigo.
- `infra/ansible`: automatizacion de configuracion y despliegue.
- `docs`: documentacion requerida por la practica.

## Relacion con el enunciado

Segun el enunciado, la solucion debe contemplar:

- Un frontend para visualizar el catalogo de servicios medicos.
- Un microservicio de Servicios Medicos.
- Un microservicio de Especialidades.
- Un API Gateway como punto de entrada.
- Terraform para aprovisionamiento de infraestructura.
- Ansible para configuracion del entorno y despliegue.

La estructura del repositorio ya refleja esos elementos mediante las carpetas
`frontend`, `gateway`, `services`, `infra/terraform`, `infra/ansible` y `docs`.

## Diagrama de alto nivel

Esta seccion queda pendiente de completar con el diagrama final de arquitectura de
despliegue solicitado en el enunciado.

## Distribucion del repositorio

```text
docs/
frontend/
gateway/
infra/
  ansible/
  terraform/
services/
  especialidades/
  servicios-medicos/
```

## Observaciones

- El nombre `gateway` se mantiene como nombre de carpeta del punto de entrada del
  sistema.
- La carpeta `reference/` puede utilizarse como apoyo de trabajo local, pero no forma
  parte de la arquitectura funcional del sistema ni del entregable principal.
- Aun hace falta completar la implementacion interna de cada componente para reflejar
  la arquitectura por capas solicitada en el enunciado.

## Conclusion

La estructura de carpetas actual si es acorde al enunciado a nivel de organizacion
general. No contradice la practica y establece una base correcta para continuar con la
implementacion del frontend, el gateway, los microservicios, la infraestructura y la
documentacion final.
