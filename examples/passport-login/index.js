// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-passport-login
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const application = require('./dist');

module.exports = application;

if (require.main === module) {
  application.main().catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
