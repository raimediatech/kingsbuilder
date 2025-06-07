#!/bin/bash
# Rollback script for KingsBuilder
ENVIRONMENT=$1
VERSION=$2

if [ -z "$ENVIRONMENT" ] || [ -z "$VERSION" ]; then
  echo "Usage: ./rollback.sh [staging|production] [version]"
  exit 1
fi

echo "Starting rollback to version $VERSION in $ENVIRONMENT environment..."

if [ "$ENVIRONMENT" == "production" ]; then
  shopify app deploy --version=$VERSION
else
  shopify app deploy --environment=staging --version=$VERSION
fi

node scripts/health-check.js
echo "Rollback completed!"
