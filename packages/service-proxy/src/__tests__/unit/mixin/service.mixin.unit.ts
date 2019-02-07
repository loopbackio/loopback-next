// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/service-proxy
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application, Component, Provider} from '@loopback/core';
import {expect} from '@loopback/testlab';
import {Class, ServiceMixin} from '../../../';

// tslint:disable:no-any

describe('ServiceMixin', () => {
  it('mixed class has .serviceProvider()', () => {
    const myApp = new AppWithServiceMixin();
    expect(typeof myApp.serviceProvider).to.be.eql('function');
  });

  it('binds repository from app.serviceProvider()', async () => {
    const myApp = new AppWithServiceMixin();

    expectGeocoderToNotBeBound(myApp);
    myApp.serviceProvider(GeocoderServiceProvider);
    await expectGeocoderToBeBound(myApp);
  });

  it('binds a component without services', () => {
    class EmptyTestComponent {}

    const myApp = new AppWithServiceMixin();
    myApp.component(EmptyTestComponent);

    expectComponentToBeBound(myApp, EmptyTestComponent);
  });

  it('binds a component with a service provider from .component()', async () => {
    const myApp = new AppWithServiceMixin();

    const boundComponentsBefore = myApp.find('components.*').map(b => b.key);
    expect(boundComponentsBefore).to.be.empty();
    expectGeocoderToNotBeBound(myApp);

    myApp.component(GeocoderComponent);

    expectComponentToBeBound(myApp, GeocoderComponent);
    await expectGeocoderToBeBound(myApp);
  });

  class AppWithServiceMixin extends ServiceMixin(Application) {}

  interface GeoPoint {
    lat: number;
    lng: number;
  }

  interface GeocoderService {
    geocode(address: string): Promise<GeoPoint>;
  }

  // A dummy service instance to make unit testing easier
  const GeocoderSingleton: GeocoderService = {
    geocode(address: string) {
      return Promise.resolve({lat: 0, lng: 0});
    },
  };

  class GeocoderServiceProvider implements Provider<GeocoderService> {
    value(): Promise<GeocoderService> {
      return Promise.resolve(GeocoderSingleton);
    }
  }

  class GeocoderComponent {
    serviceProviders = [GeocoderServiceProvider];
  }

  async function expectGeocoderToBeBound(myApp: Application) {
    const boundRepositories = myApp.find('services.*').map(b => b.key);
    expect(boundRepositories).to.containEql('services.GeocoderService');
    const repoInstance = await myApp.get('services.GeocoderService');
    expect(repoInstance).to.equal(GeocoderSingleton);
  }

  function expectGeocoderToNotBeBound(myApp: Application) {
    const boundRepos = myApp.find('services.*').map(b => b.key);
    expect(boundRepos).to.be.empty();
  }

  function expectComponentToBeBound(
    myApp: Application,
    component: Class<Component>,
  ) {
    const boundComponents = myApp.find('components.*').map(b => b.key);
    expect(boundComponents).to.containEql(`components.${component.name}`);
    const componentInstance = myApp.getSync(`components.${component.name}`);
    expect(componentInstance).to.be.instanceOf(component);
  }
});
