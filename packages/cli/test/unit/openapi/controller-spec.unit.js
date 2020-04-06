// Copyright IBM Corp. 2018,2020. All Rights Reserved.
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
        description: 'Customer resource',
        className: 'CustomerController',
        imports: ["import {Customer} from '../models/customer.model';"],
        methods: [
          {
            description: 'Returns all customers (/* customers */)',
            comments: [
              'Returns all customers (/* customers */)',
              '\n',
              '@param _if if condition',
              '@param limit maximum number of results to return',
              '@param accessToken Access token (/* access_token */)',
              '@returns customer response',
            ],
            decoration: "@operation('get', '/customers')",
            signature:
              "async getCustomers(@param({name: 'if', in: 'query'}) _if: " +
              "string[], @param({name: 'limit', in: 'query'}) limit: number, " +
              "@param({name: 'access-token', in: 'query'}) accessToken: " +
              'string): Promise<Customer[]>',
          },
          {
            description: 'Creates a new customer',
            comments: [
              'Creates a new customer',
              '\n',
              '@param _requestBody Customer to add',
              '@param accessToken Access token (/* access_token */)',
              '@returns customer response',
            ],
            decoration: "@operation('post', '/customers')",
            signature:
              'async createCustomer(@requestBody() _requestBody: Customer, ' +
              "@param({name: 'access-token', in: 'query'}) accessToken: " +
              'string): Promise<Customer>',
          },
          {
            description: 'Returns a customer based on a single ID',
            comments: [
              'Returns a customer based on a single ID',
              '\n',
              '@param customerId ID of customer to fetch',
              '@returns customer response',
            ],
            decoration: "@operation('get', '/customers/{customer_id}')",
            signature:
              "async findCustomerById(@param({name: 'customer_id', " +
              "in: 'path'}) customerId: number): Promise<Customer>",
            implementation:
              "return {id: id, 'first-name': 'John', last-name: 'Smith'};",
          },
        ],
      },
    ]);
  });
});
