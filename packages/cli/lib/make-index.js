// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const util = require('util');
const glob = util.promisify(require('glob'));
const path = require('path');
const fs = require('fs');
const format = require('./format');
const debug = require('./debug')('make-index');

/**
 * A utility function to make index files to export artifacts from a folder
 * for easier imports
 *
 * @param {string} dir The directory for which to generate index files.
 * @param {object} options
 * options.nested: boolean = true
 * options.prefix: string | string[] = ''
 * options.commentHeader:string = SEE BELOW
 */
module.exports = async function(dir, options = {}) {
  // Only exporting typescript files.
  // TODO: @virkt25 -- May want this to be configurable in the future?
  const EXTENSION = '.ts';

  // Default Options for Making an exports index file
  const defaultOptions = {
    nested: true,
    prefix: '',
    regenerate: false,
    commentHeader: `This is an auto-generated file. DO NOT EDIT.`,
    commentFooter: `This is an auto-generated file. DO NOT EDIT.`,
  };

  // Merge User Options with defaultOptions
  options = Object.assign(defaultOptions, options);

  // If prefix is array, convert to a string that can be used in a glob
  options.prefix = Array.isArray(options.prefix)
    ? `@(${options.prefix.join('|')})`
    : options.prefix;

  // Glob pattern for search
  const globPattern = `*${options.prefix}${EXTENSION}`;

  debug(`dir => ${dir}`);
  debug(`options => ${JSON.stringify(options)}`);
  debug(`globPattern =>: ${globPattern}`);

  // Glob Options object for running glob search
  const globOptions = {root: dir, matchBase: options.nested};

  // Run a Glob Search
  const files = await glob(globPattern, globOptions);
  const lines = [];

  // Add comment header as first line
  if (options.commentHeader) {
    lines.push(normalizeComment(options.commentHeader));
  }

  // For each file discovers by the glob pattern, generate an export statement
  files.forEach(file => {
    const relPath = `export * from './${path
      .relative(dir, file)
      .slice(0, -3)}';`;
    lines.push(relPath);
  });

  // Add comment footer if present
  if (options.commentFooter) {
    lines.push('\n');
    lines.push(normalizeComment(options.commentFooter));
  }

  // Turn array into a string and format it using prettier formatter
  const code = format(lines.join('\n'));

  debug('===== code =====');
  debug(code);
  debug('===== code =====');

  const outFile = `${dir}/index.ts`;
  debug(`outFile => ${outFile}`);

  const writeFileAsync = util.promisify(fs.writeFile);
  await writeFileAsync(outFile, code);
};

/**
 * Takes a string and turns it into a comment -- existing comments are normalized
 *
 * @param {string} comment String to be converted to comment
 */
function normalizeComment(comment) {
  const comments = comment.split('\n');
  let normalizedComment = '';

  // For each comment line -- if it's a comment we
  comments.forEach(comment => {
    normalizedComment += `${
      comment.startsWith('//') ? comment : '// ' + comment
    }\n`;
  });
  normalizedComment += '\n';

  return normalizedComment;
}
