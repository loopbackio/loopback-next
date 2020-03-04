// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/typeorm
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  givenAppWithCustomConfig,
  givenAppWithExtensionPoint,
  runTest,
} from './test-helpers';

runTest('with config', givenAppWithCustomConfig);

runTest('with extension point', givenAppWithExtensionPoint);
