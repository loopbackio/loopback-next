#!/bin/bash

# This scripts builds a small Jekyll site to preview LB4 documentation changes.
# The idea is to get as close to `strongloop/loopback.io` configuration as
# possible, while removing as many non-LB4 pages as possible.

# Set `-e` so that non-zero exit code from any step will be honored
set -e

# Make sure we use the correct repo root dir
DIR=`dirname $0`
DOCS_ROOT=$DIR/..
REPO_ROOT=$DIR/../..

pushd $DOCS_ROOT > /dev/null

SOURCE_DIR=_loopback.io
if [ ! -d $SOURCE_DIR ]; then
  echo "Shadow cloning the strongloop/loopback.io github repo"
  git clone --depth 1 https://github.com/strongloop/loopback.io.git $SOURCE_DIR
else
  echo "Found existing loopback.io clone, pulling latest changes"
  (cd $SOURCE_DIR && git pull)
fi

echo "Installing setup dependencies"
npm install --no-save js-yaml

JEKYLL_DIR=_preview
rm -rf $JEKYLL_DIR
mkdir $JEKYLL_DIR

node bin/build-jekyll-preview-config $SOURCE_DIR/_config.yml $JEKYLL_DIR/_config.yml

echo "Copying LB4 readmes"
node bin/copy-readmes

echo "Copying LB4 changelogs"
node bin/copy-changelogs

echo "Copyping Gemfile, index.html and data files"
rm -rf $JEKYLL_DIR/{_data,_includes,_layouts}
cp -r $SOURCE_DIR/Gemfile* $JEKYLL_DIR/
cp -r $SOURCE_DIR/index.html $JEKYLL_DIR/
cp -r $SOURCE_DIR/_data $JEKYLL_DIR/
cp -r $SOURCE_DIR/_includes $JEKYLL_DIR/
cp -r $SOURCE_DIR/_layouts $JEKYLL_DIR/

echo "Copying static assets"
cp -r $SOURCE_DIR/{css,images,dist,js,fonts} $JEKYLL_DIR/
rm -rf $JEKYLL_DIR/doc
mkdir -p $JEKYLL_DIR/doc
cp -r $SOURCE_DIR/doc/index.md $JEKYLL_DIR/doc

echo "Setting up LB4 doc pages",
rm -rf $JEKYLL_DIR/pages
# Create hardlinks because Jekyll does not support symbolic links any more.
# Use `pax` because `ln` does not support directory recursion.
mkdir $JEKYLL_DIR/pages
(TARGET="$PWD/$JEKYLL_DIR/pages" && cd "$PWD/site" && pax -rwlpe . $TARGET)

echo "Setting up sidebar(s)"
rm -rf $JEKYLL_DIR/_data/sidebars
# Create hardlinks because Jekyll does not support symbolic links any more.
# Use `pax` because `ln` does not support directory recursion.
mkdir $JEKYLL_DIR/_data/sidebars
(TARGET="$PWD/$JEKYLL_DIR/_data/sidebars" && cd "$PWD/site/sidebars" && pax -rwlpe . $TARGET)

echo "Installing Ruby dependencies"
(cd $JEKYLL_DIR && bundle install)

echo "Done. Run the following command to start the site:"
echo ""
echo "  npm run docs:start"
echo ""
echo "NOTE: Watch mode is not supported yet."
