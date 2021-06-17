// Copyright The LoopBack Authors 2020,2021. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

// IMPORTANT
// This snapshot file is auto-generated, but designed for humans.
// It should be checked into source control and tracked carefully.
// Re-generate by setting UPDATE_SNAPSHOTS=1 and running tests.
// Make sure to inspect the changes in the snapshots below.
// Do not ignore changes!

'use strict';

exports[`lb4 relation HasOne checks generated source class repository answers {"relationType":"hasOne","sourceModel":"Customer","destinationModel":"Address","registerInclusionResolver":false} generates Customer repository file with different inputs 1`] = `
import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasOneRepositoryFactory} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Customer, Address} from '../models';
import {AddressRepository} from './address.repository';

export class CustomerRepository extends DefaultCrudRepository<
  Customer,
  typeof Customer.prototype.id
> {

  public readonly address: HasOneRepositoryFactory<Address, typeof Customer.prototype.id>;

  constructor(@inject('datasources.db') dataSource: DbDataSource, @repository.getter('AddressRepository') protected addressRepositoryGetter: Getter<AddressRepository>,) {
    super(Customer, dataSource);
    this.address = this.createHasOneRepositoryFactoryFor('address', addressRepositoryGetter);
  }
}

`;


exports[`lb4 relation HasOne checks generated source class repository answers {"relationType":"hasOne","sourceModel":"Customer","destinationModel":"Address"} generates Customer repository file with different inputs 1`] = `
import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasOneRepositoryFactory} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Customer, Address} from '../models';
import {AddressRepository} from './address.repository';

export class CustomerRepository extends DefaultCrudRepository<
  Customer,
  typeof Customer.prototype.id
> {

  public readonly address: HasOneRepositoryFactory<Address, typeof Customer.prototype.id>;

  constructor(@inject('datasources.db') dataSource: DbDataSource, @repository.getter('AddressRepository') protected addressRepositoryGetter: Getter<AddressRepository>,) {
    super(Customer, dataSource);
    this.address = this.createHasOneRepositoryFactoryFor('address', addressRepositoryGetter);
    this.registerInclusionResolver('address', this.address.inclusionResolver);
  }
}

`;


exports[`lb4 relation HasOne checks if the controller file created  answers {"relationType":"hasOne","sourceModel":"Customer","destinationModel":"Address","relationName":"myAddress"} checks controller content with hasOne relation 1`] = `
import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {
  Customer,
  Address,
} from '../models';
import {CustomerRepository} from '../repositories';

export class CustomerAddressController {
  constructor(
    @repository(CustomerRepository) protected customerRepository: CustomerRepository,
  ) { }

  @get('/customers/{id}/address', {
    responses: {
      '200': {
        description: 'Customer has one Address',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Address),
          },
        },
      },
    },
  })
  async get(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Address>,
  ): Promise<Address> {
    return this.customerRepository.myAddress(id).get(filter);
  }

  @post('/customers/{id}/address', {
    responses: {
      '200': {
        description: 'Customer model instance',
        content: {'application/json': {schema: getModelSchemaRef(Address)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Customer.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Address, {
            title: 'NewAddressInCustomer',
            exclude: ['id'],
            optional: ['customerId']
          }),
        },
      },
    }) address: Omit<Address, 'id'>,
  ): Promise<Address> {
    return this.customerRepository.myAddress(id).create(address);
  }

  @patch('/customers/{id}/address', {
    responses: {
      '200': {
        description: 'Customer.Address PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Address, {partial: true}),
        },
      },
    })
    address: Partial<Address>,
    @param.query.object('where', getWhereSchemaFor(Address)) where?: Where<Address>,
  ): Promise<Count> {
    return this.customerRepository.myAddress(id).patch(address, where);
  }

  @del('/customers/{id}/address', {
    responses: {
      '200': {
        description: 'Customer.Address DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Address)) where?: Where<Address>,
  ): Promise<Count> {
    return this.customerRepository.myAddress(id).delete(where);
  }
}

`;


exports[`lb4 relation HasOne checks if the controller file created  answers {"relationType":"hasOne","sourceModel":"Customer","destinationModel":"Address"} checks controller content with hasOne relation 1`] = `
import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {
  Customer,
  Address,
} from '../models';
import {CustomerRepository} from '../repositories';

export class CustomerAddressController {
  constructor(
    @repository(CustomerRepository) protected customerRepository: CustomerRepository,
  ) { }

  @get('/customers/{id}/address', {
    responses: {
      '200': {
        description: 'Customer has one Address',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Address),
          },
        },
      },
    },
  })
  async get(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Address>,
  ): Promise<Address> {
    return this.customerRepository.address(id).get(filter);
  }

  @post('/customers/{id}/address', {
    responses: {
      '200': {
        description: 'Customer model instance',
        content: {'application/json': {schema: getModelSchemaRef(Address)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Customer.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Address, {
            title: 'NewAddressInCustomer',
            exclude: ['id'],
            optional: ['customerId']
          }),
        },
      },
    }) address: Omit<Address, 'id'>,
  ): Promise<Address> {
    return this.customerRepository.address(id).create(address);
  }

  @patch('/customers/{id}/address', {
    responses: {
      '200': {
        description: 'Customer.Address PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Address, {partial: true}),
        },
      },
    })
    address: Partial<Address>,
    @param.query.object('where', getWhereSchemaFor(Address)) where?: Where<Address>,
  ): Promise<Count> {
    return this.customerRepository.address(id).patch(address, where);
  }

  @del('/customers/{id}/address', {
    responses: {
      '200': {
        description: 'Customer.Address DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Address)) where?: Where<Address>,
  ): Promise<Count> {
    return this.customerRepository.address(id).delete(where);
  }
}

`;


exports[`lb4 relation HasOne generates model relation with custom foreignKey answers {"relationType":"hasOne","sourceModel":"Customer","destinationModel":"Address","foreignKeyName":"mykey"} add the keyTo to the source model 1`] = `
import {Entity, model, property, hasOne} from '@loopback/repository';
import {Address} from './address.model';

@model()
export class Customer extends Entity {
  @property({
    type: 'number',
    id: true,
    default: 0,
  })
  id?: number;

  @property({
    type: 'string',
  })
  name?: string;

  @hasOne(() => Address, {keyTo: 'mykey'})
  address: Address;

  constructor(data?: Partial<Customer>) {
    super(data);
  }
}

`;


exports[`lb4 relation HasOne generates model relation with custom foreignKey answers {"relationType":"hasOne","sourceModel":"Customer","destinationModel":"Address","foreignKeyName":"mykey"} add the keyTo to the source model 2`] = `
import {Entity, model, property} from '@loopback/repository';

@model()
export class Address extends Entity {
  @property({
    type: 'number',
    id: true,
    default: 0,
  })
  id?: number;

  @property({
    type: 'string',
  })
  name?: string;

  @property({
    type: 'number',
  })
  mykey?: number;

  constructor(data?: Partial<Address>) {
    super(data);
  }
}

`;


exports[`lb4 relation HasOne generates model relation with custom relation name answers {"relationType":"hasOne","sourceModel":"Customer","destinationModel":"Address","relationName":"myAddress"} relation name should be myAddress 1`] = `
import {Entity, model, property, hasOne} from '@loopback/repository';
import {Address} from './address.model';

@model()
export class Customer extends Entity {
  @property({
    type: 'number',
    id: true,
    default: 0,
  })
  id?: number;

  @property({
    type: 'string',
  })
  name?: string;

  @hasOne(() => Address)
  myAddress: Address;

  constructor(data?: Partial<Customer>) {
    super(data);
  }
}

`;


exports[`lb4 relation HasOne generates model relation with custom relation name answers {"relationType":"hasOne","sourceModel":"Customer","destinationModel":"Address","relationName":"myAddress"} relation name should be myAddress 2`] = `
import {Entity, model, property} from '@loopback/repository';

@model()
export class Address extends Entity {
  @property({
    type: 'number',
    id: true,
    default: 0,
  })
  id?: number;

  @property({
    type: 'string',
  })
  name?: string;

  @property({
    type: 'number',
  })
  customerId?: number;

  constructor(data?: Partial<Address>) {
    super(data);
  }
}

`;


exports[`lb4 relation HasOne generates model relation with default values answers {"relationType":"hasOne","sourceModel":"Customer","destinationModel":"Address"} has correct default imports 1`] = `
import {Entity, model, property, hasOne} from '@loopback/repository';
import {Address} from './address.model';

@model()
export class Customer extends Entity {
  @property({
    type: 'number',
    id: true,
    default: 0,
  })
  id?: number;

  @property({
    type: 'string',
  })
  name?: string;

  @hasOne(() => Address)
  address: Address;

  constructor(data?: Partial<Customer>) {
    super(data);
  }
}

`;
