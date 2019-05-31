// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/benchmark
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import * as request from 'request-promise-native';
import {Benchmark} from '..';
import {Autocannon, EndpointStats} from '../autocannon';

const debug = require('debug')('test');

const DUMMY_STATS: EndpointStats = {
  latency: 1,
  requestsPerSecond: 1000,
};

describe('Benchmark (SLOW)', function() {
  // Unfortunately, the todo app requires one second to start
  // eslint-disable-next-line no-invalid-this
  this.timeout(5000);
  it('works', async () => {
    const bench = new Benchmark();
    bench.cannonFactory = url => new AutocannonStub(url);
    const result = await bench.run();
    expect(result).to.eql({
      'find all todos': DUMMY_STATS,
      'create a new todo': DUMMY_STATS,
    });
  });

  class AutocannonStub extends Autocannon {
    constructor(url: string) {
      super(url, 1 /* duration does not matter */);
    }

    async execute(
      title: string,
      urlPath: string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      options?: any,
    ): Promise<EndpointStats> {
      if (!options) options = {};

      const requestOptions: request.OptionsWithUrl = {
        url: this.buildUrl(urlPath),
        method: options.method || 'GET',
        json: true,
        body: options.body ? JSON.parse(options.body) : undefined,
      };

      debug(
        'Making a dummy autocannon request %s %s',
        requestOptions.method,
        requestOptions.url,
      );

      // Verify that the server is implementing the requested URL
      await request(requestOptions);

      return DUMMY_STATS;
    }
  }
});
