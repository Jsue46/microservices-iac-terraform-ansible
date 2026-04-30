output "public_ips" {
  description = "Public IPs assigned to each GCE node (static or ephemeral based on create_static_ips)."
  value = {
    for name, vm in google_compute_instance.compute : name => try(vm.network_interface[0].access_config[0].nat_ip, null)
  }
}

output "load_balancer_ip" {
  description = "Global public IP of the external HTTP load balancer."
  value       = try(google_compute_global_address.load_balancer[0].address, null)
}

output "load_balancer_url" {
  description = "Base URL served by the external HTTP load balancer."
  value       = try("http://${google_compute_global_address.load_balancer[0].address}", null)
}

output "private_ips" {
  description = "Private IPs for each GCE node inside the VPC subnet."
  value = {
    for name, vm in google_compute_instance.compute : name => vm.network_interface[0].network_ip
  }
}

output "cloud_sql_connection_name" {
  description = "Cloud SQL connection name."
  value       = try(google_sql_database_instance.postgres[0].connection_name, null)
}

output "cloud_sql_public_ip" {
  description = "Cloud SQL public IP address."
  value       = try(google_sql_database_instance.postgres[0].public_ip_address, null)
}

output "cloud_sql_database" {
  description = "Provisioned database name in Cloud SQL."
  value       = try(google_sql_database.app[0].name, null)
}

output "cloud_sql_username" {
  description = "Provisioned database username in Cloud SQL."
  value       = try(google_sql_user.app[0].name, null)
}

output "ansible_inventory_example" {
  description = "INI content example to paste into infra/ansible/inventory.ini"
  value = join("\n", concat(
    flatten([
      for node_name in sort(keys(google_compute_instance.compute)) : [
        "[${replace(node_name, "-", "_")}]",
        "${replace(node_name, "-", "_")} ansible_host=${try(google_compute_instance.compute[node_name].network_interface[0].access_config[0].nat_ip, "")} ansible_user=${var.ansible_user}",
        ""
      ]
    ]),
    [
      "[all:vars]",
      "ansible_ssh_private_key_file=${var.ansible_ssh_private_key_file}"
    ]
  ))
}
