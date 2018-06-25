// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const expect = require('@loopback/testlab').expect;
const {loadAndBuildSpec} = require('../../../generators/openapi/spec-loader');
const path = require('path');

describe('openapi to controllers/models', () => {
  const customer = path.join(
    __dirname,
    '../../fixtures/openapi/3.0/customer.yaml',
  );

  it('generates models for customer', async () => {
    const customerSepc = await loadAndBuildSpec(customer);
    expect(customerSepc.controllerSpecs).to.eql([
      {
        tag: 'Customer',
        className: 'CustomerController',
        description: 'Customer resource',
        imports: ["import {Customer} from '../models/customer.model';"],
        methods: [
          {
            description: 'Returns all customers',
            decoration: "@operation('get', '/customers')",
            signature:
              "async ''(@param({name: 'if', in: 'query'}) _if: string[], " +
              "@param({name: 'limit', in: 'query'}) limit: number, " +
              "@param({name: 'access-token', in: 'query'}) " +
              'accessToken: string): ' +
              'Promise<Customer[]>',
          },
          {
            description: 'Creates a new customer',
            decoration: "@operation('post', '/customers')",
            signature:
              "async createCustomer(@param({name: 'access-token', " +
              "in: 'query'}) accessToken: string): Promise<Customer>",
          },
          {
            description: 'Returns a customer based on a single ID',
            decoration: "@operation('get', '/customers/{id}')",
            signature:
              "async findCustomerById(@param({name: 'id', in: 'path'}) " +
              'id: number): Promise<Customer>',
          },
        ],
      },
    ]);
  });
});
