// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/service-proxy
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application, Context, inject, Provider} from '@loopback/core';
import {expect} from '@loopback/testlab';
import {ServiceMixin} from '../..';

describe('ServiceMixin - service providers and proxies', () => {
  class AppWithServiceMixin extends ServiceMixin(Application) {}

  interface GeoPoint {
    lat: number;
    lng: number;
  }

  interface GeocoderService {
    geocode(address: string): Promise<GeoPoint>;
  }

  class DummyGeocoder implements GeocoderService {
    constructor(public apiKey: string) {}

    geocode(address: string) {
      return Promise.resolve({lat: 0, lng: 0});
    }
  }

  class GeocoderServiceProvider implements Provider<GeocoderService> {
    constructor(@inject('apiKey') private apiKey: string) {}
    value(): Promise<GeocoderService> {
      // Returns different instances so that we can verify the TRANSIENT
      // binding scope, which is now the default for service proxies
      return Promise.resolve(new DummyGeocoder(this.apiKey));
    }
  }

  it('binds a service provider in TRANSIENT scope by default', async () => {
    const myApp = new AppWithServiceMixin();
    myApp.serviceProvider(GeocoderServiceProvider);
    const myReq1 = new Context(myApp, 'request1');
    myReq1.bind('apiKey').to('123');
    const service1 = await myReq1.get<DummyGeocoder>(
      'services.GeocoderService',
    );
    expect(service1.apiKey).to.eql('123');

    const myReq2 = new Context(myApp, 'request2');
    myReq2.bind('apiKey').to('456');
    const service2 = await myReq2.get<DummyGeocoder>(
      'services.GeocoderService',
    );
    expect(service2.apiKey).to.eql('456');
  });
});
