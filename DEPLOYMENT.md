# KingsBuilder Deployment Guide

This document outlines the deployment process for the KingsBuilder application.

## Environments

KingsBuilder uses three environments:

1. **Development**: Local development environment
2. **Staging**: Pre-production testing environment
3. **Production**: Live environment for end users

## Prerequisites

- Node.js (v18.x or v20.x)
- npm
- Shopify CLI
- MongoDB
- Docker and Docker Compose (for containerized deployment)
- GitHub account (for CI/CD)

## CI/CD Pipeline

KingsBuilder uses GitHub Actions for continuous integration and deployment. The pipeline includes:

1. **Testing**: Runs linting and unit tests
2. **Building**: Builds the application
3. **Deployment**: Deploys to staging or production based on the branch

### Workflow Files

- `.github/workflows/ci.yml`: Main CI/CD pipeline
- `.github/workflows/monitoring.yml`: Scheduled health checks

## Manual Deployment

### Using Shopify CLI

```bash
# Deploy to staging
npm run build
shopify app deploy --environment=staging

# Deploy to production
npm run build
shopify app deploy
```

### Using Docker

```bash
# Build and start containers
docker-compose up -d

# View logs
docker-compose logs -f
```

## Rollback Procedure

If a deployment causes issues, you can roll back to a previous version:

```bash
# Roll back to a specific version
./scripts/rollback.sh production v1.2.3
```

## Monitoring

KingsBuilder includes comprehensive monitoring:

1. **Health Checks**: Regular checks of API endpoints and database
2. **Metrics**: Performance and usage metrics via Prometheus
3. **Dashboards**: Grafana dashboards for visualizing metrics

### Accessing Monitoring

- Health Check: `https://[your-domain]/api/health`
- Metrics: `https://[your-domain]/api/metrics`
- Grafana: `https://[your-domain]:3001` (when using Docker)

## Environment Variables

See `.env.example` for required environment variables. Make sure to set these in your deployment environment.
