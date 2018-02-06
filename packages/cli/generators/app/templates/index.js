// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const application = (module.exports = require('./dist'));

if (require.main === module) {
  // Run the application
  application.main();
}
