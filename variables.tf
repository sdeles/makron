variable "aws_region" {
  description = "A região da AWS onde os recursos serão criados."
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Nome base para os recursos, para fácil identificação."
  type        = string
  default     = "MercadoLivre"
}

variable "ml_app_id" {
  description = "O App ID da sua aplicação no Mercado Livre."
  type        = string
  sensitive   = true # Marca como sensível para não aparecer nos logs
}

variable "ml_secret_key" {
  description = "A Secret Key da sua aplicação no Mercado Livre."
  type        = string
  sensitive   = true
}