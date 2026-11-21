# Medical Services Platform — Microservices with IaC (Terraform + Ansible)

Academic project developed for the **Systems Analysis and Design 2** course at the Universidad de San Carlos de Guatemala (Second Semester 2026).

This repository contains a web platform for browsing medical services and specialties, built using a microservices architecture with an API Gateway, and deployed automatically on Google Cloud Platform using Infrastructure as Code. The project was developed collaboratively as a group assignment.

---

## Overview

The system exposes a frontend web interface that communicates with two independent backend microservices through a central API Gateway. All infrastructure is defined declaratively with **Terraform** (network, VMs, Cloud SQL) and deployed with **Ansible** (container orchestration and configuration injection).

---

## Architecture

```
[ Web Frontend ]
      |
      v
[ API Gateway ]
      |
      +---> [ Microservice: Medical Services ] <--> [ PostgreSQL ]
      |
      +---> [ Microservice: Specialties ]      <--> [ PostgreSQL ]

Infrastructure: GCP (VMs + Cloud SQL) provisioned with Terraform
Deployment: Ansible playbooks for container setup and config injection
```

---

## Key Features

- RESTful API Gateway as a single entry point for all client requests
- Independent microservices for medical services and specialties, each with optional PostgreSQL or in-memory persistence
- Containerized services with Docker and Docker Compose
- Infrastructure provisioned on GCP: VMs, networking, and Cloud SQL via Terraform HCL
- Ansible playbooks for automated container deployment and configuration management
- No hardcoded IPs — all configuration injected at deployment time

---

## Technologies

- **Frontend:** TypeScript, HTML, CSS
- **Gateway:** JavaScript (Node.js)
- **Microservices:** TypeScript, PostgreSQL (PLpgSQL)
- **Infrastructure:** Terraform (HCL), GCP
- **Deployment:** Ansible, Docker, Docker Compose

---

## Repository Structure

```
microservices-iac-terraform-ansible/
├── docs/
│   ├── arquitectura-despliegue.md
│   └── manual-usuario.md
├── frontend/
├── gateway/
├── services/
│   ├── servicios-medicos/
│   └── especialidades/
├── infra/
│   ├── terraform/             # GCP network, VMs, Cloud SQL
│   └── ansible/               # Container deployment playbooks
├── reference/
├── docker-compose.yml
└── README.md
```

---

## Academic Context

| Field       | Detail                                              |
|-------------|-----------------------------------------------------|
| Course      | Systems Analysis and Design 2 (AYD2)               |
| Institution | Universidad de San Carlos de Guatemala              |
| Semester    | Second Semester 2026                                |
| Type        | Group project                                       |
