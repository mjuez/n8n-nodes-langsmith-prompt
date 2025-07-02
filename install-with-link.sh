#!/bin/bash

set -ex

# Get the absolute path to the project directory (do this first)
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Clean up any existing installation
echo "Cleaning up previous installation..."
rm -rf ~/.n8n/custom
npm unlink -g 2>/dev/null || true

# More thorough cleanup
echo "Performing additional cleanup..."
rm -rf node_modules
rm -rf dist

# Install dependencies and build
echo "Building the package..."
npm ci
npm run lint
npm run build

# Create the global link
echo "Creating global link..."
npm link

# Create the n8n custom directory if it doesn't exist
mkdir -p ~/.n8n/custom

# Link the package to n8n with more robust error handling
echo "Linking package to n8n..."
cd ~/.n8n/custom

# Create node_modules directory if it doesn't exist
mkdir -p node_modules

# Create direct symlink to the package
echo "Copying necessary files..."
# Copy necessary files instead of symlinking the whole directory
mkdir -p node_modules/n8n-nodes-langsmith-prompt
cp -r "$PROJECT_DIR/dist" "$PROJECT_DIR/package.json" "$PROJECT_DIR/index.js" node_modules/n8n-nodes-langsmith-prompt/
echo "Installation complete."

# Start n8n only if linking was successful
echo "Ready to start n8n."
