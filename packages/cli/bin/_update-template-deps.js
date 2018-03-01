#!/usr/bin/env node
// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

/**
 * This is an internal utility to update `lib/dependencies.json`, which declares
 * a set of dependencies used by our CLI templates for projects.
 *
 * Usage:
 * ```
 * node bin/_update-template-deps.js >lib/dependencies.json
 * ```
 */

// Load dependencies from `@loopback/build`
const buildDeps = require('@loopback/build/package.json').dependencies;

// LoopBack modules
const lbModules = {
  // Comments
  '//1': 'This file contains dependency/version used by project templates',
  '//2':
    'It can be updated by running `node bin/_update-template-deps.js >lib/dependencies.json`',
  // LoopBack packages
  '@loopback/authentication': '',
  '@loopback/boot': '',
  '@loopback/context': '',
  '@loopback/core': '',
  '@loopback/metadata': '',
  '@loopback/openapi-spec-builder': '',
  '@loopback/openapi-spec': '',
  '@loopback/openapi-v2': '',
  '@loopback/openapi-v3-types': '',
  '@loopback/openapi-v3': '',
  '@loopback/repository-json-schema': '',
  '@loopback/repository': '',
  '@loopback/rest': '',
  '@loopback/testlab': '',
};

// Load dependencies from `../lib/dependencies.json`
const currentDeps = require('../lib/dependencies.json');

// Add entries from build deps
const deps = Object.assign({}, lbModules, currentDeps, buildDeps);

// Convert to JSON
const json = JSON.stringify(deps, null, 2);

console.log(json);
