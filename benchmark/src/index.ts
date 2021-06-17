// Copyright The LoopBack Authors 2018,2021. All Rights Reserved.
// Node module: @loopback/benchmark
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Benchmark, Options} from './benchmark';

export {Benchmark, Options};

export async function main() {
  const duration = process.env.DURATION ?? '30';
  const options: Options = {
    duration: +duration,
  };
  const bench = new Benchmark(options);
  bench.logger = (title, stats) => console.log('%s:', title, stats);
  await bench.run();
}

if (require.main === module) {
  main().then(
    success => process.exit(0),
    err => {
      console.error('Cannot run the benchmark.', err);
      process.exit(1);
    },
  );
}
