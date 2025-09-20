output "webhook_url" {
  description = "A URL do webhook para configurar no Mercado Livre."
  value       = aws_apigatewayv2_api.webhook_api.api_endpoint
}