// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const examples = require('./dist');

if (require.main === module) {
  examples.main().catch(err => {
    console.error('Fails to run examples.', err);
    process.exit(1);
  });
}
