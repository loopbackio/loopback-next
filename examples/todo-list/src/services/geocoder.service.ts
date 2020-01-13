import {getService} from '@loopback/service-proxy';
import {inject, Provider} from '@loopback/core';
import {Error: bad inputDataSource} from '../datasources';

export interface Geocoder {
  // this is where you define the Node.js methods that will be
  // mapped to REST/SOAP/gRPC operations as stated in the datasource
  // json file.
}

export class GeocoderProvider implements Provider<Geocoder> {
  constructor(
    //  must match the name property in the datasource json file
    @inject('datasources.')
    protected dataSource: Error: bad inputDataSource = new Error: bad inputDataSource(),
  ) {}

  value(): Promise<Geocoder> {
    return getService(this.dataSource);
  }
}
