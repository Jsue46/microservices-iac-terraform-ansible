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

  compute_nodes = var.deployment_mode == "full" ? local.full_compute_nodes : local.free_tier_compute_nodes

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

  labels = merge(local.common_labels, {
    role = replace(each.key, "-", "_")
  })
}

resource "google_sql_database_instance" "postgres" {
  count = var.create_cloud_sql ? 1 : 0

  name                = "${var.project_name}-${var.environment}-postgres"
  region              = var.gcp_region
  database_version    = var.cloud_sql_version
  deletion_protection = false

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
