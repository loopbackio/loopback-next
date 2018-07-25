import {inject} from '@loopback/core';
import {juggler, AnyObject} from '@loopback/repository';
const config = require('./calculator.datasource.json');

export class CalculatorDataSource extends juggler.DataSource {
  static dataSourceName = 'calculator';

  constructor(
    @inject('datasources.config.calculator', {optional: true})
    dsConfig: AnyObject = config,
  ) {
    dsConfig = Object.assign({}, dsConfig, {
      // A workaround for the current design flaw where inside our monorepo,
      //  packages/service-proxy/node_modules/loopback-datasource-juggler cannot
      //  see/load the connector from examples/soap/node_modules/loopback-connector-soap
      //  as explained in todo example
      connector: require('loopback-connector-soap'),
    });
    super(dsConfig);
  }
}
