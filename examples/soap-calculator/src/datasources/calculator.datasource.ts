// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/example-soap-calculator
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'calculator',
  // A workaround for the current design flaw where inside our monorepo,
  //  packages/service-proxy/node_modules/loopback-datasource-juggler cannot
  //  see/load the connector from examples/soap/node_modules/loopback-connector-soap
  //  as explained in todo example
  connector: require('loopback-connector-soap'),
  url: 'https://calculator-webservice.mybluemix.net/calculator',
  wsdl: 'https://calculator-webservice.mybluemix.net/calculator?wsdl',
  remotingEnabled: true,
  operations: {
    multiply: {
      service: 'CalculatorService',
      port: 'CalculatorPort',
      operation: 'Multiply',
    },
    add: {
      service: 'CalculatorService',
      port: 'CalculatorPort',
      operation: 'Add',
    },
    subtract: {
      service: 'CalculatorService',
      port: 'CalculatorPort',
      operation: 'Subtract',
    },
    divide: {
      service: 'CalculatorService',
      port: 'CalculatorPort',
      operation: 'Divide',
    },
  },
};

export class CalculatorDataSource extends juggler.DataSource {
  static dataSourceName = 'calculator';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.calculator', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
