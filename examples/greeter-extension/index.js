// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-greeter-extension
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

module.exports = require('./dist');

if (require.main === module) {
  const app = new module.exports.GreetingApplication();
  app.main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
