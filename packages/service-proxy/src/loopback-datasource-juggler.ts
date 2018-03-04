// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/service-proxy
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

// tslint:disable:no-any

export declare namespace juggler {
  /**
   * DataSource instance properties/operations
   */
  export class DataSource {
    name: string;
    connected?: boolean;
    connector?: object;
    settings: {[name: string]: any};
    DataAccessObject: {[name: string]: any};

    constructor(name?: string, settings?: {[name: string]: any});
    constructor(settings?: {[name: string]: any});
  }
}
