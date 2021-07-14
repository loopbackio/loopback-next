// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/benchmark
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import assert from 'assert';
import autocannon from 'autocannon';

export interface EndpointStats {
  requestsPerSecond: number;
  latency: number;
}

export class Autocannon {
  constructor(protected url: string, protected duration: number) {}

  async execute(
    title: string,
    urlPath: string,
    options: Omit<autocannon.Options, 'url'> = {},
  ): Promise<EndpointStats> {
    const config = {
      url: this.buildUrl(urlPath),
      duration: this.duration,
      title,
      ...options,
      headers: {
        'content-type': 'application/json',
        ...options.headers,
      },
    };

    const data = await autocannon(config);
    assert.equal(
      data.non2xx,
      0,
      'No request should have failed with non-2xx status code.',
    );
    const stats: EndpointStats = {
      requestsPerSecond: data.requests.average,
      latency: data.latency.average,
    };
    return stats;
  }

  protected buildUrl(urlPath: string) {
    return this.url + urlPath;
  }
}
