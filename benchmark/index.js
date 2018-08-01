// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/benchmark
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const bench = require('@loopback/dist-util').loadDist(__dirname);

module.exports = bench;

if (require.main === module) {
  bench.main().then(
    success => process.exit(0),
    err => {
      console.error('Cannot run the benchmark.', err);
      process.exit(1);
    },
  );
}
