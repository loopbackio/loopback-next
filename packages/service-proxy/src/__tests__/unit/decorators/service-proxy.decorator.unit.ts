// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/service-proxy
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Context} from '@loopback/context';
import {serviceProxy} from '../../../';

import {juggler} from '../../../';

import {MockConnector} from '../../mock-service.connector';

interface GeoCode {
  lat: number;
  lng: number;
}

interface GeoService {
  geocode(street: string, city: string, zipcode: string): Promise<GeoCode>;
}

class MyController {
  constructor(@serviceProxy('googleMap') public geoService: GeoService) {}
}

describe('serviceProxy decorator', () => {
  let ctx: Context;
  let ds: juggler.DataSource;

  before(function() {
    ds = new juggler.DataSource({
      name: 'db',
      connector: MockConnector,
    });

    ctx = new Context();
    ctx.bind('datasources.googleMap').to(ds);
    ctx.bind('controllers.MyController').toClass(MyController);
  });

  it('supports @serviceProxy(dataSourceName)', async () => {
    const myController = await ctx.get<MyController>(
      'controllers.MyController',
    );
    expect(myController.geoService).to.be.a.Function();
  });

  it('supports @serviceProxy(dataSource)', async () => {
    class MyControllerWithService {
      constructor(@serviceProxy(ds) public geoService: GeoService) {}
    }

    ctx
      .bind('controllers.MyControllerWithService')
      .toClass(MyControllerWithService);

    const myController = await ctx.get<MyControllerWithService>(
      'controllers.MyControllerWithService',
    );
    expect(myController.geoService).to.be.a.Function();
  });

  it('throws an error if dataSource is not present in @serviceProxy', () => {
    class MyControllerWithService {
      constructor(@serviceProxy('') public geoService: GeoService) {}
    }

    ctx
      .bind('controllers.MyControllerWithService')
      .toClass(MyControllerWithService);

    const controller = ctx.get<MyControllerWithService>(
      'controllers.MyControllerWithService',
    );
    return expect(controller).to.be.rejectedWith(
      '@serviceProxy must provide a name or an instance of DataSource',
    );
  });
});
