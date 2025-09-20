# Copilot Instructions for MaKron Codebase

## Overview
This repository contains two main Terraform-based projects for AWS integration and ML workflows:
- `gemini/`: Manages ML-related AWS Lambda functions and credentials.
- `ml-aws-integration/`: Handles AWS Lambda integration and infrastructure provisioning.

## Key Components
- **Terraform Files**: `main.tf`, `variables.tf`, `outputs.tf` in both main directories define AWS resources and variables. State is tracked in `terraform.tfstate`.
- **Lambda Functions**: Source code for AWS Lambda is in `gemini/lambda_function/index.js` and `ml-aws-integration/lambda/index.js`. Each has its own `package.json` for dependencies.
- **Credentials**: Sensitive keys for ML services are stored in `gemini/ml-credentials.txt` and `gemini/AA/chaveapimeli.txt`.

## Developer Workflows
- **Deploy Infrastructure**: Run `terraform init` and `terraform apply` in the relevant directory (`gemini/` or `ml-aws-integration/`).
- **Update Lambda Code**: Edit the respective `index.js`, then re-zip and update the Lambda function via AWS CLI or Terraform.
- **Credentials Management**: Never commit real credentials. Use placeholder values in PRs and document required secrets in `ml-credentials.txt` format.

## Project Conventions
- **Directory Structure**: Each major component (ML, AWS integration) is isolated in its own directory with all related code and infra.
- **Secrets**: All secrets are stored in `.txt` files and should be gitignored (ensure `.gitignore` covers these).
- **Terraform State**: State files are local by default. For team use, configure remote state.

## Integration Points
- **AWS Lambda**: Both projects deploy Lambda functions, with code and infra managed together.
- **External ML Services**: Credentials in `ml-credentials.txt` are used for external ML APIs.

## Examples
- To deploy Gemini Lambda: `cd gemini && terraform apply`
- To update ML credentials: Edit `gemini/ml-credentials.txt` with `app:` and `key:` fields.

## References
- `gemini/lambda_function/index.js`: Example Lambda handler
- `ml-aws-integration/lambda/index.js`: AWS integration Lambda
- `gemini/ml-credentials.txt`: ML API credentials format

---

For questions or unclear workflows, check for comments in `main.tf` or Lambda source files, or ask a maintainer.
