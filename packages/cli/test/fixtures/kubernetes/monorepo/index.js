// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const testUtils = require('../../../test-utils');

/**
 * requiring this module will return a list of all files
 */
module.exports = testUtils.discoverFiles(__dirname);
