// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/benchmark
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Options} from 'autocannon';
import axios, {AxiosRequestConfig, Method} from 'axios';
import {Benchmark} from '..';
import {Autocannon, EndpointStats} from '../autocannon';

const debug = require('debug')('test');

const DUMMY_STATS: EndpointStats = {
  latency: 1,
  requestsPerSecond: 1000,
};

describe('Benchmark (SLOW)', function () {
  // Unfortunately, the todo app requires one second to start (or more on CI)
  // eslint-disable-next-line no-invalid-this
  this.timeout(10000);
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
      options?: Omit<Options, 'url'>,
    ): Promise<EndpointStats> {
      if (!options) options = {};

      const requestOptions: AxiosRequestConfig = {
        url: this.buildUrl(urlPath),
        method: (options.method ?? 'GET') as Method,
        responseType: 'json',
        data: options.body ? JSON.parse(options.body as string) : undefined,
      };

      debug(
        'Making a dummy autocannon request %s %s',
        requestOptions.method,
        requestOptions.url,
      );

      // Verify that the server is implementing the requested URL
      await axios(requestOptions);

      return DUMMY_STATS;
    }
  }
});
