# Configura o provider da AWS
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# 1. Tabela DynamoDB para armazenar as vendas
resource "aws_dynamodb_table" "sales_table" {
  name           = "${var.project_name}Vendas"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "mercadoLivreId"

  attribute {
    name = "mercadoLivreId"
    type = "S"
  }
}

# 2. IAM Role e Policy para a função Lambda
resource "aws_iam_role" "lambda_role" {
  name = "${var.project_name}LambdaRole"

  # Política de confiança que permite que o serviço Lambda assuma este papel
  assume_role_policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [{
      Action    = "sts:AssumeRole",
      Effect    = "Allow",
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_policy" "lambda_policy" {
  name   = "${var.project_name}LambdaPolicy"
  policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [
      {
        # Permissão para escrever logs no CloudWatch
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Effect   = "Allow",
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        # Permissão para ler e escrever na nossa tabela DynamoDB
        Action = [
          "dynamodb:PutItem",
          "dynamodb:GetItem"
        ],
        Effect   = "Allow",
        Resource = aws_dynamodb_table.sales_table.arn
      }
    ]
  })
}

# Anexa a política ao papel
resource "aws_iam_role_policy_attachment" "lambda_attach" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.lambda_policy.arn
}

# 3. Função Lambda
# Este recurso depende que o arquivo 'function.zip' exista no mesmo diretório
resource "aws_lambda_function" "webhook_handler" {
  function_name = "${var.project_name}WebhookHandler"
  handler       = "index.handler"
  runtime       = "nodejs20.x"
  role          = aws_iam_role.lambda_role.arn

  filename         = "function.zip"
  source_code_hash = filebase64sha256("function.zip")

  environment {
    variables = {
      ML_APP_ID     = var.ml_app_id
      ML_SECRET_KEY = var.ml_secret_key
      TABLE_NAME    = aws_dynamodb_table.sales_table.name
    }
  }
  
  timeout = 30 # Aumenta o timeout para 30 segundos para dar tempo para as chamadas de API
}

# 4. API Gateway (HTTP API)
resource "aws_apigatewayv2_api" "webhook_api" {
  name          = "${var.project_name}WebhookAPI"
  protocol_type = "HTTP"
  target        = aws_lambda_function.webhook_handler.invoke_arn
}

# 5. Permissão para o API Gateway invocar a Lambda
resource "aws_lambda_permission" "api_gw_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.webhook_handler.function_name
  principal     = "apigateway.amazonaws.com"

  # Restringe a permissão para a nossa API Gateway específica
  source_arn = "${aws_apigatewayv2_api.webhook_api.execution_arn}/*/*"
}