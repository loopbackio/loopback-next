// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {GeocoderDataSource} from '../../../datasources/geocoder.datasource';
import {Geocoder, GeocoderProvider} from '../../../services';
import {
  aLocation,
  getProxiedGeoCoderConfig,
  givenCachingProxy,
  HttpCachingProxy,
  isGeoCoderServiceAvailable,
} from '../../helpers';

describe('GeoLookupService', function() {
  // eslint-disable-next-line no-invalid-this
  this.timeout(30 * 1000);

  let cachingProxy: HttpCachingProxy;
  before(async () => (cachingProxy = await givenCachingProxy()));
  after(() => cachingProxy.stop());

  let service: Geocoder;
  before(givenGeoService);

  let available = true;
  before(async () => {
    available = await isGeoCoderServiceAvailable(service);
  });

  it('resolves an address to a geo point', async function() {
    // eslint-disable-next-line no-invalid-this
    if (!available) return this.skip();

    const points = await service.geocode(aLocation.address);

    expect(points).to.deepEqual([aLocation.geopoint]);
  });

  async function givenGeoService() {
    const config = getProxiedGeoCoderConfig(cachingProxy);
    const dataSource = new GeocoderDataSource(config);
    service = await new GeocoderProvider(dataSource).value();
  }
});
