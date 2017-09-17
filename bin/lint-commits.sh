#!/bin/bash
set -e
set -u

if [[ $TRAVIS_PULL_REQUEST_SLUG != "" && $TRAVIS_PULL_REQUEST_SLUG != $TRAVIS_REPO_SLUG ]]; then
  # This is a Pull Request from a different slug, hence a forked repository
  git remote add "$TRAVIS_PULL_REQUEST_SLUG" "https://github.com/$TRAVIS_PULL_REQUEST_SLUG.git"
  git fetch "$TRAVIS_PULL_REQUEST_SLUG"

  # Use the fetched remote pointing to the source clone for comparison
  TO="$TRAVIS_PULL_REQUEST_SLUG/$TRAVIS_PULL_REQUEST_BRANCH"
else
  # This is a Pull Request from the same remote, no clone repository
  TO=$TRAVIS_COMMIT

  if [[ $TRAVIS_PULL_REQUEST_SHA != "" && $TRAVIS_PULL_REQUEST_SHA != $TRAVIS_COMMIT ]]; then
    echo "TO => TRAVIS_PULL_REQUEST_SHA"
    TO=$TRAVIS_PULL_REQUEST_SHA
  fi
fi

echo "TRAVIS_BRANCH => $TRAVIS_BRANCH"
echo "TRAVIS_COMMIT => $TRAVIS_COMMIT"
echo "TRAVIS_COMMIT_MSG => $TRAVIS_COMMIT_MESSAGE"
echo "TRAVIS_COMMIT_RANGE => $TRAVIS_COMMIT_RANGE"
echo "TRAVIS_EVENT_TYPE => $TRAVIS_EVENT_TYPE"
echo "TRAVIS_PULL_REQUEST => $TRAVIS_PULL_REQUEST"
echo "TRAVIS_PULL_REQUEST_BRANCH => $TRAVIS_PULL_REQUEST_BRANCH"
echo "TRAVIS_PULL_REQUEST_SHA => $TRAVIS_PULL_REQUEST_SHA"
echo "TRAVIS_PULL_REQUEST_SLUG => $TRAVIS_PULL_REQUEST_SLUG"
echo "TRAVIS_REPO_SLUG => $TRAVIS_REPO_SLUG"

# Lint all commits in the PR
# - Covers fork pull requests (when TO=slug/branch)
# - Covers branch pull requests (when TO=branch)
./node_modules/.bin/commitlint --from="$TRAVIS_BRANCH" --to="$TO"

# Always lint the triggering commit
# - Covers direct commits
COMMIT=$TRAVIS_COMMIT
if [[ $TRAVIS_PULL_REQUEST_SHA != "" && $TRAVIS_PULL_REQUEST_SHA != $TRAVIS_COMMIT ]]; then
  COMMIT=$TRAVIS_PULL_REQUEST_SHA
fi

./node_modules/.bin/commitlint --from="$COMMIT"
