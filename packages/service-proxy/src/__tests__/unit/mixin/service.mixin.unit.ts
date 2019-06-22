// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/service-proxy
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Application,
  bind,
  BindingScope,
  Component,
  Provider,
} from '@loopback/core';
import {expect} from '@loopback/testlab';
import {Class, ServiceMixin} from '../../../';

describe('ServiceMixin', () => {
  it('mixed class has .serviceProvider()', () => {
    const myApp = new AppWithServiceMixin();
    expect(typeof myApp.serviceProvider).to.be.eql('function');
  });

  it('binds service from app.serviceProvider()', async () => {
    const myApp = new AppWithServiceMixin();

    expectGeocoderToNotBeBound(myApp);
    myApp.serviceProvider(GeocoderServiceProvider);
    await expectGeocoderToBeBound(myApp);
  });

  it('binds singleton service from app.serviceProvider()', async () => {
    @bind({scope: BindingScope.SINGLETON})
    class SingletonGeocoderServiceProvider extends GeocoderServiceProvider {}
    const myApp = new AppWithServiceMixin();

    const binding = myApp.serviceProvider(SingletonGeocoderServiceProvider);
    expect(binding.scope).to.equal(BindingScope.SINGLETON);
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

  class DummyGeocoder implements GeocoderService {
    geocode(address: string) {
      return Promise.resolve({lat: 0, lng: 0});
    }
  }

  class GeocoderServiceProvider implements Provider<GeocoderService> {
    value(): Promise<GeocoderService> {
      // Returns different instances so that we can verify the TRANSIENT
      // binding scope, which is now the default for service proxies
      return Promise.resolve(new DummyGeocoder());
    }
  }

  class GeocoderComponent {
    serviceProviders = [GeocoderServiceProvider];
  }

  async function expectGeocoderToBeBound(myApp: Application) {
    const boundServices = myApp.find('services.*').map(b => b.key);
    expect(boundServices).to.containEql('services.GeocoderService');
    const binding = myApp.getBinding('services.GeocoderService');
    expect(binding.scope).to.equal(BindingScope.TRANSIENT);
    const serviceInstance1 = await myApp.get('services.GeocoderService');
    expect(serviceInstance1).to.be.instanceOf(DummyGeocoder);
    const serviceInstance2 = await myApp.get('services.GeocoderService');
    expect(serviceInstance2).to.not.be.equal(serviceInstance1);
  }

  function expectGeocoderToNotBeBound(myApp: Application) {
    const boundServices = myApp.find('services.*').map(b => b.key);
    expect(boundServices).to.be.empty();
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
