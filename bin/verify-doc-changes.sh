#!/bin/bash
set -e

# Test LoopBack.io will build if changes made to @loopback/docs
echo "TASK => VERIFY DOCS"
if git diff --name-only --quiet $TRAVIS_BRANCH docs/; then
  echo "No changes to @loopback/docs in this PR"
  exit 0
else
  echo "Testing @loopback/docs"
  npm run verify:docs
fi
