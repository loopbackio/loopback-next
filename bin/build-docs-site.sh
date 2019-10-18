#!/bin/bash

# This script builds/verifies that `docs` is able to be served by `loopback.io`
# site. It runs the following steps:
# 1. Clone `strongloop/loopback.io` github repository into `sandbox`
# 2. Bootstrap `loopback.io` package using `lerna` to use `docs` folder for
# `@loopback/docs` dependency
# 3. Run `npm run build` for `loopback.io` module to make sure jekyll can
# generate the web site successfully

# Set `-e` so that non-zero exit code from any step will be honored
set -e

if ! [ -x "$(command -v bundle)" ]; then
  echo 'Error: You must have Bundler installed (http://bundler.io)' >&2
  exit 1
fi

# Set `-v` (verbose) for travis build
if [ -n "$TRAVIS" ]; then
  set -v
fi

# Make sure we use the correct repo root dir
DIR=`dirname $0`
REPO_ROOT=$DIR/..
pushd $REPO_ROOT >/dev/null

# Update apidocs
lerna bootstrap
lerna run --scope @loopback/docs prepack

# Clean up sandbox/loopback.io directory
rm -rf sandbox/loopback.io/

# Shadow clone the `strongloop/loopback.io` github repo
git clone --depth 1 https://github.com/strongloop/loopback.io.git sandbox/loopback.io

# Add loopback.io-workflow-scripts with @loopback/docs linked
lerna bootstrap --no-ci --scope loopback.io-workflow-scripts --include-filtered-dependencies

pushd $REPO_ROOT/sandbox/loopback.io/ >/dev/null

# Run bundle install for ruby gems required for `loopback.io`
bundle install

# Run npm build script to fetch readme files and generate jekyll site
# npm run build

popd >/dev/null
if [ "$1" == "--verify" ]; then
# Clean up sandbox/loopback.io/ if `--verify`
  rm -rf sandbox/loopback.io/
fi
popd >/dev/null
