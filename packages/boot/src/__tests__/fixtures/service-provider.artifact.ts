// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Provider} from '@loopback/core';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface GeocoderService {
  geocode(address: string): Promise<GeoPoint>;
}

// A dummy service instance to make unit testing easier
const GeocoderSingleton: GeocoderService = {
  geocode(address: string) {
    return Promise.resolve({lat: 0, lng: 0});
  },
};

export class GeocoderServiceProvider implements Provider<GeocoderService> {
  value(): Promise<GeocoderService> {
    return Promise.resolve(GeocoderSingleton);
  }
}
