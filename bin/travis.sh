#!/bin/bash
set -e

# Running Code Linter -- Requires @loopback/build so it's bootstrapped
if [ $TASK = "code-lint" ]; then
  echo "TASK => LINTING CODE"
  lerna bootstrap --scope @loopback/build
  npm run lint

# Commit Message Linter
elif [ $TASK = "commit-lint" ]; then
  echo "TASK => COMMIT MESSAGE LINTING"
  commitlint-travis

# Test LoopBack.io will build if changes made to @loopback/docs
elif [ $TASK = "verify-docs" ]; then
  echo "TASK => VERIFY DOCS"
  if git diff --name-only --quiet $TRAVIS_BRANCH docs/; then
    echo "No changes to @loopback/docs in this PR"
    exit 0
  else
    echo "Testing @loopback/docs"
    npm run verify:docs
  fi

# Mocha Tests
else
  echo "TASK => MOCHA TESTS"
  npm run postinstall
  npm run test:ci
fi
