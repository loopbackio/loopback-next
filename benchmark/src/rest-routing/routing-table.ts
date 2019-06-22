// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {anOpenApiSpec} from '@loopback/openapi-spec-builder';
import {
  RoutingTable,
  TrieRouter,
  RestRouter,
  RegExpRouter,
  OpenApiSpec,
} from '@loopback/rest';

function runBenchmark(count = 1000) {
  const spec = givenNumberOfRoutes('/hello', count);

  const trieTest = givenRouter(new TrieRouter(), spec, count);
  const regexpTest = givenRouter(new RegExpRouter(), spec, count);

  const result1 = trieTest();
  const result2 = regexpTest();

  console.log(
    '%s %s %s %s %s',
    'name'.padEnd(12),
    'duration'.padStart(16),
    'count'.padStart(8),
    'found'.padStart(8),
    'missed'.padStart(8),
  );
  for (const r of [result1, result2]) {
    console.log(
      '%s %s %s %s %s',
      `${r.name}`.padEnd(12),
      `${r.duration}`.padStart(16),
      `${r.count}`.padStart(8),
      `${r.found}`.padStart(8),
      `${r.missed}`.padStart(8),
    );
  }
}

function givenNumberOfRoutes(base: string, num: number) {
  const spec = anOpenApiSpec();
  let i = 0;
  while (i < num) {
    // Add 1/4 paths with vars
    if (i % 4 === 0) {
      spec.withOperationReturningString(
        'get',
        `${base}/group${i}/{version}`,
        `greet${i}`,
      );
    } else {
      spec.withOperationReturningString(
        'get',
        `${base}/group${i}/version_${i}`,
        `greet${i}`,
      );
    }
    i++;
  }
  const result = spec.build();
  result.basePath = '/my';
  return result;
}

function givenRouter(router: RestRouter, spec: OpenApiSpec, count: number) {
  const name = router.constructor.name;
  class TestController {}

  return (log?: (...args: unknown[]) => void) => {
    log = log || (() => {});
    log('Creating %s, %d', name, count);
    let start = process.hrtime();

    const table = new RoutingTable(router);
    table.registerController(spec, TestController);
    router.list(); // Force sorting
    log('Created %s %s', name, process.hrtime(start));

    log('Starting %s %d', name, count);
    let found = 0,
      missed = 0;
    start = process.hrtime();
    for (let i = 0; i < count; i++) {
      let group = `group${i}`;
      if (i % 8 === 0) {
        // Make it not found
        group = 'groupX';
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const request: any = {
        method: 'get',
        path: `/my/hello/${group}/version_${i}`,
      };

      try {
        table.find(request);
        found++;
      } catch (e) {
        missed++;
      }
    }
    log('Done %s', name);
    return {name, duration: process.hrtime(start), count, found, missed};
  };
}

let tests = process.argv.slice(2);
if (!tests.length) {
  tests = ['1000'];
}
tests.forEach(n => {
  runBenchmark(+n);
  console.log('\n');
});
