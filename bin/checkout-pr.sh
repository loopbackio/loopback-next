#!/bin/bash

# This is an internal script for LoopBack maintainers to check out the forked
# repo/branch for a given pull request

# Sometimes a LoopBack maintainer needs to help improve/fix a pull request.
# This script allows us to set up the PR code base as follows:
# 
# 1. Read the url and branch for base and head for the PR
# 2. Clone the forked repository and branch
# 3. Set up upstream to strongloop/loopback-next
# 4. Fetch changes from upstream branch
# 5. Rebase the PR branch to the upstream branch

# Set `-e` so that non-zero exit code from any step will be honored
set -e

if [ -z "$1" ]; then
  echo "Usage: $0 PR-number-or-url <targetDir>"
  exit 1
fi

if ! [ -x "$(command -v jq)" ]; then
  echo 'Error: You must have jq installed (https://stedolan.github.io/jq/download/)' >&2
  exit 1
fi

# The first argument can be the PR number or url, such as:
# 4049 or https://github.com/strongloop/loopback-next/pull/4049
INPUT="$1"
PR=${INPUT##*/}

echo Pull request '#'${PR}

JQ_FILTER=".head.repo.ssh_url,.head.ref,.base.repo.ssh_url,.base.ref"
REPOS=$(curl -s https://api.github.com/repos/strongloop/loopback-next/pulls/${PR}|jq -r ${JQ_FILTER})

# git@github.com:aleksspeaker/loopback-next.git patch-1 git@github.com:strongloop/loopback-next.git master
HEAD_URL=$(echo $REPOS | cut -f1 -d ' ')
HEAD_BRANCH=$(echo $REPOS | cut -f2 -d ' ')
BASE_URL=$(echo $REPOS | cut -f3 -d ' ')
BASE_BRANCH=$(echo $REPOS | cut -f4 -d ' ')

echo "$HEAD_URL#$HEAD_BRANCH => $BASE_URL#$BASE_BRANCH"

TARGET_DIR="$2"
TARGET_DIR=${TARGET_DIR:=/tmp}

echo Clone $HEAD_URL to $TARGET_DIR
cd $TARGET_DIR
git clone -b ${HEAD_BRANCH} ${HEAD_URL} pr-${PR}

cd pr-${PR}

echo Set up upstream to $BASE_URL
git remote add upstream ${BASE_URL}

echo Fetch changes from upstream ${BASE_BRANCH}
git fetch upstream ${BASE_BRANCH}

echo Rebase PR branch to upstream/${BASE_BRANCH}
git rebase upstream/${BASE_BRANCH}

echo PR ${PR} is now checked out at $(pwd).
