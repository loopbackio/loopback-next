#!/bin/bash

# Make sure we use the correct repo root dir
DIR=`dirname $0`
REPO_ROOT=$DIR/..

if [ -z "$1" ]
then
  echo Usage: $0 '<feature-name>'
  exit 1
fi

FEATURE=$1
echo Setting up experimental feature $FEATURE...
pushd $REPO_ROOT >/dev/null

git checkout labs/base && git fetch --all && git rebase origin/master && git checkout -b "labs/$FEATURE" && git checkout -b "labs-dev/$FEATURE"

mkdir -p "$REPO_ROOT/labs/$FEATURE"

popd >/dev/null
