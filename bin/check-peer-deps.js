#!/usr/bin/env node
// Copyright IBM Corp. 2026. All Rights Reserved.
// Node module: loopback-next
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * This is an internal script that verifies every peer dependency on another
 * package of this monorepo accepts the version that package currently has.
 *
 * The release process bumps dependencies and devDependencies, but it leaves
 * peerDependencies alone. A package that was peer-linked to core ^7 keeps that
 * range after core moves to 8, and npm then refuses to install the pair in one
 * tree (ERESOLVE). Nothing in the build notices, because the monorepo resolves
 * workspace packages by path, so the check runs in CI instead.
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');

/**
 * Expand the `workspaces` globs of the root manifest into package directories.
 * The patterns in this repository are all either a plain directory or a single
 * level of `dir/*`, so a full glob implementation is not needed.
 * @param {string} rootPath
 * @returns {Array<{name: string, version: string, location: string}>}
 */
function loadWorkspacePackages(rootPath) {
  const rootPkg = JSON.parse(
    fs.readFileSync(path.join(rootPath, 'package.json'), 'utf8'),
  );
  const patterns = rootPkg.workspaces || [];
  const packages = [];

  for (const pattern of patterns) {
    const dirs = pattern.endsWith('/*')
      ? fs
          .readdirSync(path.join(rootPath, pattern.slice(0, -2)), {
            withFileTypes: true,
          })
          .filter(d => d.isDirectory())
          .map(d => path.join(rootPath, pattern.slice(0, -2), d.name))
      : [path.join(rootPath, pattern)];

    for (const dir of dirs) {
      const manifest = path.join(dir, 'package.json');
      if (!fs.existsSync(manifest)) continue;
      const content = JSON.parse(fs.readFileSync(manifest, 'utf8'));
      if (!content.name || content.private) continue;
      packages.push({
        name: content.name,
        version: content.version,
        location: dir,
        content,
      });
    }
  }

  return packages;
}

/**
 * Split a range into its `||` alternatives.
 * @param {string} range
 * @returns {string[]}
 */
function alternatives(range) {
  return String(range)
    .split('||')
    .map(r => r.trim());
}

/**
 * Read a simple range of the form `*`, `^1.2.3`, `~1.2.3` or `1.2.3` into its
 * numbers. Returns undefined for ranges this check does not understand, which
 * are then not judged rather than reported.
 * @param {string} range
 */
function parseSimpleRange(range) {
  if (range === '*' || range === 'x' || range === '') return {any: true};
  const m = range.match(/^([~^]?)(\d+)(?:\.(\d+|x|\*))?(?:\.(\d+|x|\*))?$/);
  if (!m) return undefined;
  const num = v =>
    v === undefined || v === 'x' || v === '*' ? undefined : Number(v);
  return {
    operator: m[1],
    major: Number(m[2]),
    minor: num(m[3]),
    patch: num(m[4]),
  };
}

/**
 * Does `range` accept `version`? Only caret, tilde and exact ranges are judged,
 * anything else is reported as accepted so the check never blocks a range that
 * was written in a form it does not model.
 * @param {string} range
 * @param {string} version
 */
function rangeAccepts(range, version) {
  const [major, minor, patch] = String(version)
    .split('.')
    .map(n => Number(n));

  return alternatives(range).some(alt => {
    const r = parseSimpleRange(alt);
    if (!r || r.any) return true;
    if (r.operator === '^') {
      if (r.major !== major) return false;
      if (r.major > 0) return true;
      // ^0.minor.patch stays inside that minor
      if (r.minor === undefined) return true;
      if (r.minor !== minor) return false;
      return r.patch === undefined || patch >= r.patch;
    }
    if (r.operator === '~') {
      if (r.major !== major) return false;
      if (r.minor === undefined) return true;
      if (r.minor !== minor) return false;
      return r.patch === undefined || patch >= r.patch;
    }
    if (r.major !== major) return false;
    if (r.minor !== undefined && r.minor !== minor) return false;
    if (r.patch !== undefined && r.patch !== patch) return false;
    return true;
  });
}

/**
 * @param {string} [rootPath]
 * @returns {string[]} one message per peer dependency that excludes its target
 */
function checkPeerDependencies(rootPath = process.cwd()) {
  const packages = loadWorkspacePackages(rootPath);
  const versions = new Map(packages.map(p => [p.name, p.version]));
  const errors = [];

  for (const pkg of packages) {
    const peers = pkg.content.peerDependencies || {};
    for (const [dep, range] of Object.entries(peers)) {
      const target = versions.get(dep);
      if (!target) continue;
      if (rangeAccepts(range, target)) continue;
      const location = path.relative(rootPath, pkg.location) || '.';
      errors.push(
        `${location}/package.json declares peer ${dep} ${range}, ` +
          `but ${dep} is at ${target} in this monorepo`,
      );
    }
  }

  return errors;
}

function formatErrorsText(errors) {
  return [
    'Some peer dependencies do not accept the version of the package they point at:',
    '',
    ...errors,
    '',
    'Please fix the problems listed above and run the following command to verify:',
    'npm run check-peer-deps',
  ].join('\n');
}

module.exports = checkPeerDependencies;
module.exports.rangeAccepts = rangeAccepts;
module.exports.formatErrorsText = formatErrorsText;

if (require.main === module) {
  const errors = checkPeerDependencies();
  if (errors.length) {
    console.error(formatErrorsText(errors));
    process.exit(1);
  }
  console.log('All peer dependencies accept the current package versions.');
}
