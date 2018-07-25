// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {getService, juggler} from '@loopback/service-proxy';
import {inject, Provider} from '@loopback/core';
import {GeocoderDataSource} from '../datasources/geocoder.datasource';

export interface GeoPoint {
  /**
   * latitude
   */
  y: number;

  /**
   * longitude
   */
  x: number;
}

export interface GeocoderService {
  geocode(address: string): Promise<GeoPoint[]>;
}

export class GeocoderServiceProvider implements Provider<GeocoderService> {
  constructor(
    @inject('datasources.geocoder')
    protected datasource: juggler.DataSource = new GeocoderDataSource(),
  ) {}

  value(): Promise<GeocoderService> {
    return getService(this.datasource);
  }
}
