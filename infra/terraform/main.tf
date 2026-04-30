locals {
  full_compute_nodes = toset([
    "frontend",
    "gateway",
    "servicios-medicos",
    "especialidades"
  ])

  free_tier_compute_nodes = toset([
    "app"
  ])

  compute_nodes         = var.deployment_mode == "full" ? local.full_compute_nodes : local.free_tier_compute_nodes
  load_balancer_enabled = var.create_load_balancer && var.deployment_mode == "full"

  common_labels = merge(
    {
      project     = var.project_name
      environment = var.environment
      managed_by  = "terraform"
    },
    var.tags
  )
}

resource "google_project_service" "compute_api" {
  project            = var.gcp_project_id
  service            = "compute.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "sqladmin_api" {
  count = var.create_cloud_sql ? 1 : 0

  project            = var.gcp_project_id
  service            = "sqladmin.googleapis.com"
  disable_on_destroy = false
}

resource "google_compute_network" "main" {
  name                    = "${var.project_name}-${var.environment}-vpc"
  auto_create_subnetworks = false

  depends_on = [google_project_service.compute_api]
}

resource "google_compute_subnetwork" "public" {
  name          = "${var.project_name}-${var.environment}-public-subnet"
  ip_cidr_range = var.public_subnet_cidr
  region        = var.gcp_region
  network       = google_compute_network.main.id
}

resource "google_compute_subnetwork" "private" {
  name                     = "${var.project_name}-${var.environment}-private-subnet"
  ip_cidr_range            = var.private_subnet_cidr
  region                   = var.gcp_region
  network                  = google_compute_network.main.id
  private_ip_google_access = true
}

resource "google_compute_firewall" "allow_ssh" {
  name    = "${var.project_name}-${var.environment}-allow-ssh"
  network = google_compute_network.main.name

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  source_ranges = [var.allowed_ssh_cidr]
  target_tags   = ["${var.project_name}-node"]
}

resource "google_compute_firewall" "allow_web" {
  name    = "${var.project_name}-${var.environment}-allow-web"
  network = google_compute_network.main.name

  allow {
    protocol = "tcp"
    ports    = ["80", "443", "3000", "3001", "3002"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["${var.project_name}-node"]
}

resource "google_compute_firewall" "allow_lb_health_checks" {
  count   = local.load_balancer_enabled ? 1 : 0
  name    = "${var.project_name}-${var.environment}-allow-lb-health-checks"
  network = google_compute_network.main.name

  allow {
    protocol = "tcp"
    ports    = ["80", "3000"]
  }

  source_ranges = ["35.191.0.0/16", "130.211.0.0/22"]
  target_tags   = ["${var.project_name}-node"]
}

resource "google_compute_address" "compute" {
  for_each = var.create_static_ips ? local.compute_nodes : toset([])

  name   = "${var.project_name}-${var.environment}-${each.key}-ip"
  region = var.gcp_region
}

resource "google_compute_instance" "compute" {
  for_each = local.compute_nodes

  name         = "${var.project_name}-${var.environment}-${each.key}"
  machine_type = var.instance_type
  zone         = var.gcp_zone

  tags = ["${var.project_name}-node"]

  boot_disk {
    initialize_params {
      image = "projects/${var.image_project}/global/images/family/${var.image_family}"
      size  = var.boot_disk_size_gb
      type  = "pd-standard"
    }
  }

  network_interface {
    subnetwork = google_compute_subnetwork.public.id

    access_config {
      nat_ip = var.create_static_ips ? google_compute_address.compute[each.key].address : null
    }
  }

  metadata = var.ssh_public_key == "" ? null : {
    ssh-keys = "${var.ansible_user}:${var.ssh_public_key}"
  }

  lifecycle {
    ignore_changes = [
      metadata["ssh-keys"]
    ]
  }

  labels = merge(local.common_labels, {
    role = replace(each.key, "-", "_")
  })
}

resource "google_compute_instance_group" "frontend" {
  count = local.load_balancer_enabled ? 1 : 0

  name      = "${var.project_name}-${var.environment}-frontend-ig"
  zone      = var.gcp_zone
  instances = [google_compute_instance.compute["frontend"].id]

  named_port {
    name = "http"
    port = 80
  }
}

resource "google_compute_instance_group" "gateway" {
  count = local.load_balancer_enabled ? 1 : 0

  name      = "${var.project_name}-${var.environment}-gateway-ig"
  zone      = var.gcp_zone
  instances = [google_compute_instance.compute["gateway"].id]

  named_port {
    name = "http"
    port = 3000
  }
}

resource "google_compute_health_check" "frontend" {
  count = local.load_balancer_enabled ? 1 : 0

  name = "${var.project_name}-${var.environment}-frontend-hc"

  http_health_check {
    port         = 80
    request_path = "/"
  }
}

resource "google_compute_health_check" "gateway" {
  count = local.load_balancer_enabled ? 1 : 0

  name = "${var.project_name}-${var.environment}-gateway-hc"

  http_health_check {
    port         = 3000
    request_path = "/health"
  }
}

resource "google_compute_backend_service" "frontend" {
  count = local.load_balancer_enabled ? 1 : 0

  name                  = "${var.project_name}-${var.environment}-frontend-backend"
  protocol              = "HTTP"
  port_name             = "http"
  load_balancing_scheme = "EXTERNAL_MANAGED"
  timeout_sec           = 30
  health_checks         = [google_compute_health_check.frontend[0].id]

  backend {
    group = google_compute_instance_group.frontend[0].id
  }
}

resource "google_compute_backend_service" "gateway" {
  count = local.load_balancer_enabled ? 1 : 0

  name                  = "${var.project_name}-${var.environment}-gateway-backend"
  protocol              = "HTTP"
  port_name             = "http"
  load_balancing_scheme = "EXTERNAL_MANAGED"
  timeout_sec           = 30
  health_checks         = [google_compute_health_check.gateway[0].id]

  backend {
    group = google_compute_instance_group.gateway[0].id
  }
}

resource "google_compute_url_map" "main" {
  count = local.load_balancer_enabled ? 1 : 0

  name            = "${var.project_name}-${var.environment}-url-map"
  default_service = google_compute_backend_service.frontend[0].id

  path_matcher {
    name            = "app-routes"
    default_service = google_compute_backend_service.frontend[0].id

    path_rule {
      paths   = ["/api", "/api/*", "/health", "/health/*"]
      service = google_compute_backend_service.gateway[0].id
    }
  }

  host_rule {
    hosts        = ["*"]
    path_matcher = "app-routes"
  }
}

resource "google_compute_target_http_proxy" "main" {
  count = local.load_balancer_enabled ? 1 : 0

  name    = "${var.project_name}-${var.environment}-http-proxy"
  url_map = google_compute_url_map.main[0].id
}

resource "google_compute_global_address" "load_balancer" {
  count = local.load_balancer_enabled ? 1 : 0

  name = "${var.project_name}-${var.environment}-lb-ip"
}

resource "google_compute_global_forwarding_rule" "http" {
  count = local.load_balancer_enabled ? 1 : 0

  name                  = "${var.project_name}-${var.environment}-http-forwarding-rule"
  load_balancing_scheme = "EXTERNAL_MANAGED"
  target                = google_compute_target_http_proxy.main[0].id
  ip_address            = google_compute_global_address.load_balancer[0].address
  port_range            = "80"
}

resource "google_sql_database_instance" "postgres" {
  count = var.create_cloud_sql ? 1 : 0

  name                = "${var.project_name}-${var.environment}-postgres"
  region              = var.gcp_region
  database_version    = var.cloud_sql_version
  deletion_protection = var.cloud_sql_deletion_protection

  settings {
    tier      = var.cloud_sql_tier
    disk_size = var.cloud_sql_disk_size_gb
    disk_type = "PD_HDD"

    ip_configuration {
      ipv4_enabled = true

      dynamic "authorized_networks" {
        for_each = var.cloud_sql_authorized_cidrs
        content {
          name  = "allowed-${replace(authorized_networks.value, "/", "-")}"
          value = authorized_networks.value
        }
      }
    }
  }

  lifecycle {
    precondition {
      condition     = var.db_password != null && length(var.db_password) >= 8
      error_message = "Set db_password (min 8 chars) when create_cloud_sql=true."
    }
  }

  depends_on = [google_project_service.sqladmin_api]
}

resource "google_sql_database" "app" {
  count = var.create_cloud_sql ? 1 : 0

  name     = var.db_name
  instance = google_sql_database_instance.postgres[0].name
}

resource "google_sql_user" "app" {
  count = var.create_cloud_sql ? 1 : 0

  name     = var.db_username
  instance = google_sql_database_instance.postgres[0].name
  password = var.db_password
}
