// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const gunzip = require('gunzip-maybe');
const path = require('path');
const request = require('request');
const tar = require('tar-fs');

const GITHUB_ARCHIVE_URL =
  'https://github.com/strongloop/loopback-next/tarball/master';

module.exports = function cloneExampleFromGitHub(exampleName, cwd) {
  const outDir = path.join(cwd, `loopback4-example-${exampleName}`);

  return new Promise((resolve, reject) => {
    request(GITHUB_ARCHIVE_URL)
      .pipe(gunzip())
      .pipe(untar(outDir, exampleName))
      .on('error', reject)
      .on('finish', () => resolve(outDir));
  });
};

function untar(outDir, exampleName) {
  // The top directory is in the format "{org}-{repo}-{sha1}"
  // I am intentionally not matching an exact repository name, because I expect
  // it will change in the future, e.g. from "loopback-next" to "loopback4".
  // I am also assuming that example names never contain special RegExp
  // characters.
  const matchTopDir = /^strongloop-loopback[^\/]*\//;

  const sourceDir = `examples/${exampleName}/`;

  // Unfortunately the tar-fs is designed in such way that "map" is called
  // before "ignore" and there is no way how "map" can mark an entry for
  // skipping.
  // As a workaround, we are renaming all entries we want to ignore to a file name
  // containing this placeholder value. The value is crafted in such way
  // that the probability of a conflict with a real file in LoopBack repo
  // is minimal.
  const DISCARD_THIS_ENTRY = 'IGNORE_THIS_ENTRY_1B6DAPkxt3';

  const DISCARD_ABSOLUTE_PATH = path.resolve(outDir, DISCARD_THIS_ENTRY);
  const tarOptions = {
    map: header => {
      // Remove the top dir like "strongloop-loopback-next-a50405a"
      let name = header.name.replace(matchTopDir, '');

      // Remove "examples/{name}" of files we want to keep,
      // rename the entry to a special value for files we want to discard.
      header.name = name.startsWith(sourceDir)
        ? name.slice(sourceDir.length)
        : DISCARD_THIS_ENTRY;

      return header;
    },

    // Ignore files outside of our example package
    ignore: absolutePath => absolutePath === DISCARD_ABSOLUTE_PATH,
  };

  return tar.extract(outDir, tarOptions);
}
