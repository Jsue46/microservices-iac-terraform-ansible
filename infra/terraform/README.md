# Terraform - Infraestructura en GCP (Integrante 4)

Este modulo aprovisiona en Google Cloud Platform la infraestructura base para la practica:

- Red VPC custom
- Subred publica y subred privada
- Firewalls (SSH, HTTP/HTTPS y puertos app)
- VMs en Compute Engine
- IP publica por VM (ephemeral por defecto o estatica opcional)
- Cloud SQL PostgreSQL opcional
- Balanceador HTTP externo opcional para publicar frontend y gateway con una sola IP

## Modo recomendado para no pagar

Valores por defecto en `terraform.tfvars`:

- `deployment_mode = "free-tier"` (solo 1 VM)
- `create_cloud_sql = false`
- `create_static_ips = false`
- `create_load_balancer = false`

Con esto minimizas costos y puedes validar tu parte de Terraform sin desplegar arquitectura completa.

## Manual paso a paso desde cero (cuenta GCP)

1. Crear cuenta

- Entra a https://cloud.google.com/
- Clic en "Get started for free"
- Completa registro y metodo de pago (Google puede pedir tarjeta para verificacion)

2. Crear proyecto

- Ve a https://console.cloud.google.com/
- Selector de proyecto -> New Project
- Nombre sugerido: `ayd2-prac2-g6`
- Guarda el `Project ID` (lo usaras en Terraform)

3. Habilitar APIs necesarias

- API Library -> habilita:
  - Compute Engine API
  - Cloud Resource Manager API
  - IAM API
  - Cloud SQL Admin API (solo si usaras DB gestionada)

4. Crear Service Account para Terraform

- IAM & Admin -> Service Accounts -> Create Service Account
- Nombre: `terraform-deployer`
- Roles minimos para practica rapida:
  - Editor
  - Service Account User
- Crear clave JSON:
  - En la service account -> Keys -> Add key -> Create new key -> JSON
- Guarda ese JSON en tu PC, por ejemplo:
  - `C:/Users/tu_usuario/.gcp/terraform-sa.json`

5. Configurar credenciales

Opcion A (recomendada): variable de entorno

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS = "C:/Users/tu_usuario/.gcp/terraform-sa.json"
```

Opcion B: archivo `terraform.tfvars`

- Coloca la ruta en `gcp_credentials_file`

6. Configurar `terraform.tfvars`

- Copia `terraform.tfvars.example` a `terraform.tfvars` si no existe
- Ajusta al menos:
  - `gcp_project_id`
  - `gcp_region`
  - `gcp_zone`
  - `allowed_ssh_cidr` (ideal: tu IP publica/32)

7. Desplegar

Desde `infra/terraform`:

```powershell
terraform init -upgrade
terraform validate
terraform plan
terraform apply
```

8. Ver salidas

```powershell
terraform output
terraform output ansible_inventory_example
```

9. Destruir al terminar (evitar cobros)

```powershell
terraform destroy
```

## Modo full (demo completa)

Si necesitas demostrar todo el enunciado en GCP:

- `deployment_mode = "full"` (4 VMs)
- `create_static_ips = true` (IPs reservadas)
- `create_cloud_sql = true` (DB gestionada)
- `create_load_balancer = true` (IP publica unica con ruteo a frontend y gateway)
- `db_password` con al menos 8 caracteres

Esto puede generar costo. Haz demo y luego `terraform destroy` el mismo dia.

## Balanceador de carga

Cuando usas:

- `deployment_mode = "full"`
- `create_load_balancer = true`

Terraform crea un balanceador HTTP externo administrado con estas rutas:

- `/` hacia `frontend` en puerto `80`
- `/api` y `/api/*` hacia `gateway` en puerto `3000`
- `/health` y `/health/*` hacia `gateway` en puerto `3000`

Para ver la IP publica:

```powershell
terraform output load_balancer_ip
terraform output load_balancer_url
```

## Integracion con Ansible

1. Ejecuta:

```powershell
terraform output ansible_inventory_example
```

2. Copia el resultado a `infra/ansible/inventory.ini`.

3. Ejecuta tu playbook de Ansible sobre esas IPs.

## Si quieres que yo haga el despliegue desde aqui

Dejame listos estos datos y yo ejecuto los comandos por ti:

1. `gcp_project_id`
2. Ruta local del JSON de service account
3. Region y zona
4. Confirmacion de modo (`free-tier` o `full`)

Con eso corro `plan` y `apply` en tu terminal.
