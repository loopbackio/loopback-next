// IMPORTANT
// This snapshot file is auto-generated, but designed for humans.
// It should be checked into source control and tracked carefully.
// Re-generate by setting UPDATE_SNAPSHOTS=1 and running tests.
// Make sure to inspect the changes in the snapshots below.
// Do not ignore changes!

'use strict';

exports[`lb4 relation HasMany checks generated source class repository answers {"relationType":"hasMany","sourceModel":"Customer","destinationModel":"Order","relationName":"custom_name","registerInclusionResolver":false} generates Customer repository file with different inputs 1`] = `
import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Customer, Order} from '../models';
import {OrderRepository} from './order.repository';

export class CustomerRepository extends DefaultCrudRepository<
  Customer,
  typeof Customer.prototype.id
> {

  public readonly custom_name: HasManyRepositoryFactory<Order, typeof Customer.prototype.id>;

  constructor(@inject('datasources.db') dataSource: DbDataSource, @repository.getter('OrderRepository') protected orderRepositoryGetter: Getter<OrderRepository>,) {
    super(Customer, dataSource);
    this.custom_name = this.createHasManyRepositoryFactoryFor('custom_name', orderRepositoryGetter,);
  }
}

`;


exports[`lb4 relation HasMany checks generated source class repository answers {"relationType":"hasMany","sourceModel":"Customer","destinationModel":"Order"} generates Customer repository file with different inputs 1`] = `
import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Customer, Order} from '../models';
import {OrderRepository} from './order.repository';

export class CustomerRepository extends DefaultCrudRepository<
  Customer,
  typeof Customer.prototype.id
> {

  public readonly orders: HasManyRepositoryFactory<Order, typeof Customer.prototype.id>;

  constructor(@inject('datasources.db') dataSource: DbDataSource, @repository.getter('OrderRepository') protected orderRepositoryGetter: Getter<OrderRepository>,) {
    super(Customer, dataSource);
    this.orders = this.createHasManyRepositoryFactoryFor('orders', orderRepositoryGetter,);
    this.registerInclusionResolver('orders', this.orders.inclusionResolver);
  }
}

`;


exports[`lb4 relation HasMany checks if the controller file created  answers {"relationType":"hasMany","sourceModel":"Customer","destinationModel":"Order","relationName":"myOrders"} checks controller content with hasMany relation 1`] = `
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
  Order,
} from '../models';
import {CustomerRepository} from '../repositories';

export class CustomerOrderController {
  constructor(
    @repository(CustomerRepository) protected customerRepository: CustomerRepository,
  ) { }

  @get('/customers/{id}/orders', {
    responses: {
      '200': {
        description: 'Array of Customer has many Order',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Order)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Order>,
  ): Promise<Order[]> {
    return this.customerRepository.myOrders(id).find(filter);
  }

  @post('/customers/{id}/orders', {
    responses: {
      '200': {
        description: 'Customer model instance',
        content: {'application/json': {schema: getModelSchemaRef(Order)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Customer.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Order, {
            title: 'NewOrderInCustomer',
            exclude: ['id'],
            optional: ['customerId']
          }),
        },
      },
    }) order: Omit<Order, 'id'>,
  ): Promise<Order> {
    return this.customerRepository.myOrders(id).create(order);
  }

  @patch('/customers/{id}/orders', {
    responses: {
      '200': {
        description: 'Customer.Order PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Order, {partial: true}),
        },
      },
    })
    order: Partial<Order>,
    @param.query.object('where', getWhereSchemaFor(Order)) where?: Where<Order>,
  ): Promise<Count> {
    return this.customerRepository.myOrders(id).patch(order, where);
  }

  @del('/customers/{id}/orders', {
    responses: {
      '200': {
        description: 'Customer.Order DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Order)) where?: Where<Order>,
  ): Promise<Count> {
    return this.customerRepository.myOrders(id).delete(where);
  }
}

`;


exports[`lb4 relation HasMany checks if the controller file created  answers {"relationType":"hasMany","sourceModel":"Customer","destinationModel":"Order"} checks controller content with hasMany relation 1`] = `
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
  Order,
} from '../models';
import {CustomerRepository} from '../repositories';

export class CustomerOrderController {
  constructor(
    @repository(CustomerRepository) protected customerRepository: CustomerRepository,
  ) { }

  @get('/customers/{id}/orders', {
    responses: {
      '200': {
        description: 'Array of Customer has many Order',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Order)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Order>,
  ): Promise<Order[]> {
    return this.customerRepository.orders(id).find(filter);
  }

  @post('/customers/{id}/orders', {
    responses: {
      '200': {
        description: 'Customer model instance',
        content: {'application/json': {schema: getModelSchemaRef(Order)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Customer.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Order, {
            title: 'NewOrderInCustomer',
            exclude: ['id'],
            optional: ['customerId']
          }),
        },
      },
    }) order: Omit<Order, 'id'>,
  ): Promise<Order> {
    return this.customerRepository.orders(id).create(order);
  }

  @patch('/customers/{id}/orders', {
    responses: {
      '200': {
        description: 'Customer.Order PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Order, {partial: true}),
        },
      },
    })
    order: Partial<Order>,
    @param.query.object('where', getWhereSchemaFor(Order)) where?: Where<Order>,
  ): Promise<Count> {
    return this.customerRepository.orders(id).patch(order, where);
  }

  @del('/customers/{id}/orders', {
    responses: {
      '200': {
        description: 'Customer.Order DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Order)) where?: Where<Order>,
  ): Promise<Count> {
    return this.customerRepository.orders(id).delete(where);
  }
}

`;


exports[`lb4 relation HasMany generates model relation with custom foreignKey answers {"relationType":"hasMany","sourceModel":"Customer","destinationModel":"Order","foreignKeyName":"mykey"} add the keyTo to the source model 1`] = `
import {Entity, model, property, hasMany} from '@loopback/repository';
import {Order} from './order.model';

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

  @hasMany(() => Order, {keyTo: 'mykey'})
  orders: Order[];

  constructor(data?: Partial<Customer>) {
    super(data);
  }
}

`;


exports[`lb4 relation HasMany generates model relation with custom foreignKey answers {"relationType":"hasMany","sourceModel":"Customer","destinationModel":"Order","foreignKeyName":"mykey"} add the keyTo to the source model 2`] = `
import {Entity, model, property} from '@loopback/repository';

@model()
export class Order extends Entity {
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

  constructor(data?: Partial<Order>) {
    super(data);
  }
}

`;


exports[`lb4 relation HasMany generates model relation with custom relation name answers {"relationType":"hasMany","sourceModel":"Customer","destinationModel":"Order","relationName":"myOrders"} relation name should be myOrders 1`] = `
import {Entity, model, property, hasMany} from '@loopback/repository';
import {Order} from './order.model';

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

  @hasMany(() => Order)
  myOrders: Order[];

  constructor(data?: Partial<Customer>) {
    super(data);
  }
}

`;


exports[`lb4 relation HasMany generates model relation with custom relation name answers {"relationType":"hasMany","sourceModel":"Customer","destinationModel":"Order","relationName":"myOrders"} relation name should be myOrders 2`] = `
import {Entity, model, property} from '@loopback/repository';

@model()
export class Order extends Entity {
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

  constructor(data?: Partial<Order>) {
    super(data);
  }
}

`;


exports[`lb4 relation HasMany generates model relation with default values answers {"relationType":"hasMany","sourceModel":"Customer","destinationModel":"Order"} has correct default imports 1`] = `
import {Entity, model, property, hasMany} from '@loopback/repository';
import {Order} from './order.model';

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

  @hasMany(() => Order)
  orders: Order[];

  constructor(data?: Partial<Customer>) {
    super(data);
  }
}

`;
