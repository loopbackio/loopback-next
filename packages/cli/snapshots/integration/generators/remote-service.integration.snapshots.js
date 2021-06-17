// Copyright The LoopBack Authors 2020,2021. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

// IMPORTANT
// This snapshot file is auto-generated, but designed for humans.
// It should be checked into source control and tracked carefully.
// Re-generate by setting UPDATE_SNAPSHOTS=1 and running tests.
// Make sure to inspect the changes in the snapshots below.
// Do not ignore changes!

'use strict';

exports[`lb4 service (remote) legacy JSON-based configuration loads config from \`{name}.datasource.config.json\` 1`] = `
import {inject, Provider} from '@loopback/core';
import {getService} from '@loopback/service-proxy';
import {LegacyDataSource} from '../datasources';

export interface MyService {
  // this is where you define the Node.js methods that will be
  // mapped to REST/SOAP/gRPC operations as stated in the datasource
  // json file.
}

export class MyServiceProvider implements Provider<MyService> {
  constructor(
    // legacy must match the name property in the datasource json file
    @inject('datasources.legacy')
    protected dataSource: LegacyDataSource = new LegacyDataSource(),
  ) {}

  value(): Promise<MyService> {
    return getService(this.dataSource);
  }
}

`;
