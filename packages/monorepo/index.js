// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/monorepo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

module.exports = {
  ...require('./lib/script-util'),
  checkPackageLocks: require('./lib/check-package-locks'),
  configLernaScopes: require('./lib/config-lerna-scopes'),
  runLerna: require('./lib/run-lerna'),
  updatePackageDeps: require('./lib/update-package-deps'),
  updatePackageJson: require('./lib/update-package-json'),
  updateTsProjectRefs: require('./lib/update-ts-project-refs'),
};
