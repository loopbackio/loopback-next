// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/service-proxy
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';

import {juggler, getService, GenericService} from '../..';

import {MockConnector} from '../mock-service.connector';

describe('service-proxy', () => {
  let ds: juggler.DataSource;

  before(function() {
    ds = new juggler.DataSource({
      name: 'mock',
      connector: MockConnector,
    });
  });

  it('invokes geocode()', async () => {
    type GeoCode = {
      lat: number;
      lng: number;
    };

    interface GeoService {
      geocode(street: string, city: string, zipcode: string): Promise<GeoCode>;
    }

    const loc = {
      street: '107 S B St',
      city: 'San Mateo',
      zipcode: '94401',
    };

    const geoService = await getService<GeoService>(ds);
    const result = await geoService.geocode(loc.street, loc.city, loc.zipcode);

    // { lat: 37.5669986, lng: -122.3237495 }
    expect(result.lat).approximately(37.5669986, 0.5);
    expect(result.lng).approximately(-122.3237495, 0.5);
  });

  it('invokes geocode() as GenericService', async () => {
    const loc = {
      street: '107 S B St',
      city: 'San Mateo',
      zipcode: '94401',
    };

    const geoService: GenericService = await getService(ds);
    const result = await geoService.geocode(loc.street, loc.city, loc.zipcode);

    // { lat: 37.5669986, lng: -122.3237495 }
    expect(result.lat).approximately(37.5669986, 0.5);
    expect(result.lng).approximately(-122.3237495, 0.5);
  });
});
