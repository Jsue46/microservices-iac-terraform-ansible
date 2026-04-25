variable "gcp_project_id" {
  description = "GCP project ID where resources will be created."
  type        = string
}

variable "gcp_region" {
  description = "GCP region for regional resources."
  type        = string
  default     = "us-central1"
}

variable "gcp_zone" {
  description = "GCP zone for VM instances."
  type        = string
  default     = "us-central1-a"
}

variable "gcp_credentials_file" {
  description = "Absolute path to a service account JSON key file. Leave empty if using GOOGLE_APPLICATION_CREDENTIALS env var."
  type        = string
  default     = ""
}

variable "project_name" {
  description = "Project identifier used in resource names and tags."
  type        = string
  default     = "ayd2-prac2-g6"
}

variable "environment" {
  description = "Environment name (dev, qa, prod)."
  type        = string
  default     = "dev"
}

variable "deployment_mode" {
  description = "Deployment profile: free-tier (1 VM) or full (4 VMs)."
  type        = string
  default     = "free-tier"

  validation {
    condition     = contains(["free-tier", "full"], var.deployment_mode)
    error_message = "deployment_mode must be 'free-tier' or 'full'."
  }
}

variable "create_cloud_sql" {
  description = "Whether to create managed PostgreSQL Cloud SQL. Keep false for free-tier-safe deployment."
  type        = bool
  default     = false
}

variable "create_static_ips" {
  description = "Whether to reserve static external IPs. Keep false for lower costs (uses ephemeral IPs)."
  type        = bool
  default     = false
}

variable "vpc_cidr" {
  description = "CIDR range for custom VPC route export metadata."
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "CIDR block for the public subnet that hosts VM instances."
  type        = string
  default     = "10.0.1.0/24"
}

variable "private_subnet_cidr" {
  description = "CIDR block for a private subnet reserved for optional managed DB resources."
  type        = string
  default     = "10.0.11.0/24"
}

variable "instance_type" {
  description = "GCE machine type for all nodes."
  type        = string
  default     = "e2-micro"
}

variable "boot_disk_size_gb" {
  description = "Boot disk size in GB for VM instances."
  type        = number
  default     = 20
}

variable "image_project" {
  description = "GCP project that provides the VM image family."
  type        = string
  default     = "debian-cloud"
}

variable "image_family" {
  description = "VM image family used for instances."
  type        = string
  default     = "debian-12"
}

variable "ansible_user" {
  description = "SSH user for Ansible inventory."
  type        = string
  default     = "debian"
}

variable "ansible_ssh_private_key_file" {
  description = "Private key path used by Ansible for SSH access."
  type        = string
  default     = "~/.ssh/id_rsa"
}

variable "ssh_public_key" {
  description = "Optional SSH public key content to inject into instance metadata."
  type        = string
  default     = ""
}

variable "allowed_ssh_cidr" {
  description = "CIDR allowed to connect over SSH to VM instances."
  type        = string
  default     = "0.0.0.0/0"
}

variable "db_name" {
  description = "Initial PostgreSQL database name for Cloud SQL."
  type        = string
  default     = "catalogo"
}

variable "db_username" {
  description = "PostgreSQL user name for Cloud SQL."
  type        = string
  default     = "appuser"
}

variable "db_password" {
  description = "PostgreSQL user password for Cloud SQL."
  type        = string
  default     = null
  nullable    = true
  sensitive   = true
}

variable "cloud_sql_tier" {
  description = "Cloud SQL machine tier."
  type        = string
  default     = "db-f1-micro"
}

variable "cloud_sql_disk_size_gb" {
  description = "Cloud SQL disk size in GB."
  type        = number
  default     = 10
}

variable "cloud_sql_version" {
  description = "Cloud SQL PostgreSQL version."
  type        = string
  default     = "POSTGRES_15"
}

variable "cloud_sql_authorized_cidrs" {
  description = "Authorized CIDRs for Cloud SQL public IP access."
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "tags" {
  description = "Additional common labels for all resources."
  type        = map(string)
  default     = {}
}
