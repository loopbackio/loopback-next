// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/service-proxy
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {juggler} from '..';
import * as legacy from 'loopback-datasource-juggler';

/**
 * A mockup service connector
 */
export class MockConnector {
  name: 'mock';
  connected?: boolean;
  dataSource: juggler.DataSource;

  static initialize(
    dataSource: juggler.DataSource,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cb: (err: any, result: any) => void,
  ) {
    const connector = new MockConnector();
    connector.dataSource = dataSource;
    dataSource.connector = connector;
    connector.connect(cb);
  }

  connect(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cb: (err: any, connected: boolean) => void,
  ) {
    this.connected = true;
    this.dataSource.connected = true;
    process.nextTick(() => {
      cb(null, true);
    });
  }

  disconnect(cb: legacy.Callback) {
    this.connected = false;
    this.dataSource.connected = false;
    process.nextTick(() => {
      cb(null);
    });
  }

  ping(cb: legacy.Callback) {
    process.nextTick(() => {
      cb(null, true);
    });
  }

  get DataAccessObject() {
    if (!this.connected) {
      // this simulates call to the connector.DataAccessObject when the
      // connector has not been connected and its DAO methods has not been
      // fully built
      return {};
    }

    return {
      geocode: async function(street: string, city: string, zipcode: string) {
        return {
          lat: 37.5669986,
          lng: -122.3237495,
        };
      },

      // loopback-datasource-juggler expects a prototype
      // https://github.com/strongloop/loopback-datasource-juggler/blob/v3.18.1/lib/datasource.js#L168
      prototype: {},
    };
  }
}
