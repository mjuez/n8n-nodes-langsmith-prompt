#!/bin/bash
# run-test.sh - Run the LangSmith helper test script

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

TEST_FILE="tests/testLangSmithHelper.ts"

if [ ! -f "$TEST_FILE" ]; then
  echo "$TEST_FILE not found!"
  exit 1
fi

if ! command -v npx >/dev/null 2>&1; then
  echo "npx is required but not found. Please install Node.js and npm."
  exit 1
fi

npx ts-node "$TEST_FILE"
