#!/usr/bin/env node
// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/tsdocs
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * An internal script to run `lerna` installed in loopback-next monorepo root.
 * loopback-next dependencies are not added to PATH when running `npm` in the
 * `fixtures` monorepo, we must locate lerna CLI manually.
 */
require('../../../../node_modules/lerna/cli.js');
