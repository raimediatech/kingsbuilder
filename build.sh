#!/bin/bash

# Build script for Vercel deployment

# Install dependencies
npm install

# Build the Remix app
npm run build

# Copy build files to the correct location
mkdir -p api/build
cp -r build/* api/build/

# Log completion
echo "Build completed successfully"
