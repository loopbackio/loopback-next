#!/bin/bash

set -ev

# Make sure we use the correct repo root dir
DIR=`dirname $0`
REPO_ROOT=$DIR/..
pushd $REPO_ROOT >/dev/null
rm -rf sandbox/loopback.io/
# Shadow clone is faster
git clone --depth 1 https://github.com/strongloop/loopback.io.git sandbox/loopback.io
lerna bootstrap --scope loopback.io-workflow-scripts
pushd $REPO_ROOT/sandbox/loopback.io/ >/dev/null
bundle install
npm run build
popd >/dev/null
popd >/dev/null
