#!/bin/bash
# Deployment script for KingsBuilder
ENVIRONMENT=$1
echo "Starting deployment to $ENVIRONMENT environment..."
npm run build
npm test

if [ "$ENVIRONMENT" == "production" ]; then
  npm run lint
  shopify app deploy
else
  shopify app deploy --environment=staging
fi

node scripts/health-check.js
echo "Deployment completed!"
