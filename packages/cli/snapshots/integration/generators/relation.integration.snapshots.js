// IMPORTANT
// This snapshot file is auto-generated, but designed for humans.
// It should be checked into source control and tracked carefully.
// Re-generate by setting UPDATE_SNAPSHOTS=1 and running tests.
// Make sure to inspect the changes in the snapshots below.
// Do not ignore changes!

'use strict';

exports[`lb4 relation Specify primary key name and type on the source and target model generates default pk name and type for controller{"relationType":"hasMany","sourceModel":"Customer","destinationModel":"Order"} 1`] = `
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
          schema: getModelSchemaRef(Order, {
            partial: true,
            exclude: ['id', 'token', ],
          }),
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


exports[`lb4 relation Specify primary key name and type on the source and target model generates fully specified pk name and type for controller{"relationType":"hasMany","sourceModel":"CustomerInheritance","destinationModel":"OrderInheritance","sourceModelPrimaryKey":"sid","sourceModelPrimaryKeyType":"string","destinationModelPrimaryKeyType":"string","destinationModelPrimaryKey":"tid"} 1`] = `
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
  CustomerInheritance,
  OrderInheritance,
} from '../models';
import {CustomerInheritanceRepository} from '../repositories';

export class CustomerInheritanceOrderInheritanceController {
  constructor(
    @repository(CustomerInheritanceRepository) protected customerInheritanceRepository: CustomerInheritanceRepository,
  ) { }

  @get('/customer-inheritances/{id}/order-inheritances', {
    responses: {
      '200': {
        description: 'Array of CustomerInheritance has many OrderInheritance',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(OrderInheritance)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<OrderInheritance>,
  ): Promise<OrderInheritance[]> {
    return this.customerInheritanceRepository.orderInheritances(id).find(filter);
  }

  @post('/customer-inheritances/{id}/order-inheritances', {
    responses: {
      '200': {
        description: 'CustomerInheritance model instance',
        content: {'application/json': {schema: getModelSchemaRef(OrderInheritance)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof CustomerInheritance.prototype.sid,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OrderInheritance, {
            title: 'NewOrderInheritanceInCustomerInheritance',
            exclude: ['tid'],
            optional: ['customerInheritanceId']
          }),
        },
      },
    }) orderInheritance: Omit<OrderInheritance, 'tid'>,
  ): Promise<OrderInheritance> {
    return this.customerInheritanceRepository.orderInheritances(id).create(orderInheritance);
  }

  @patch('/customer-inheritances/{id}/order-inheritances', {
    responses: {
      '200': {
        description: 'CustomerInheritance.OrderInheritance PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OrderInheritance, {
            partial: true,
            exclude: ['tid', ],
          }),
        },
      },
    })
    orderInheritance: Partial<OrderInheritance>,
    @param.query.object('where', getWhereSchemaFor(OrderInheritance)) where?: Where<OrderInheritance>,
  ): Promise<Count> {
    return this.customerInheritanceRepository.orderInheritances(id).patch(orderInheritance, where);
  }

  @del('/customer-inheritances/{id}/order-inheritances', {
    responses: {
      '200': {
        description: 'CustomerInheritance.OrderInheritance DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(OrderInheritance)) where?: Where<OrderInheritance>,
  ): Promise<Count> {
    return this.customerInheritanceRepository.orderInheritances(id).delete(where);
  }
}

`;


exports[`lb4 relation Specify primary key name and type on the source and target model generates partially specified pk name and type for controller{"relationType":"hasMany","sourceModel":"CustomerInheritance","destinationModel":"OrderInheritance","sourceModelPrimaryKeyType":"string","destinationModelPrimaryKeyType":"string"} 1`] = `
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
  CustomerInheritance,
  OrderInheritance,
} from '../models';
import {CustomerInheritanceRepository} from '../repositories';

export class CustomerInheritanceOrderInheritanceController {
  constructor(
    @repository(CustomerInheritanceRepository) protected customerInheritanceRepository: CustomerInheritanceRepository,
  ) { }

  @get('/customer-inheritances/{id}/order-inheritances', {
    responses: {
      '200': {
        description: 'Array of CustomerInheritance has many OrderInheritance',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(OrderInheritance)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<OrderInheritance>,
  ): Promise<OrderInheritance[]> {
    return this.customerInheritanceRepository.orderInheritances(id).find(filter);
  }

  @post('/customer-inheritances/{id}/order-inheritances', {
    responses: {
      '200': {
        description: 'CustomerInheritance model instance',
        content: {'application/json': {schema: getModelSchemaRef(OrderInheritance)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof CustomerInheritance.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OrderInheritance, {
            title: 'NewOrderInheritanceInCustomerInheritance',
            exclude: ['id'],
            optional: ['customerInheritanceId']
          }),
        },
      },
    }) orderInheritance: Omit<OrderInheritance, 'id'>,
  ): Promise<OrderInheritance> {
    return this.customerInheritanceRepository.orderInheritances(id).create(orderInheritance);
  }

  @patch('/customer-inheritances/{id}/order-inheritances', {
    responses: {
      '200': {
        description: 'CustomerInheritance.OrderInheritance PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OrderInheritance, {
            partial: true,
            exclude: ['id', ],
          }),
        },
      },
    })
    orderInheritance: Partial<OrderInheritance>,
    @param.query.object('where', getWhereSchemaFor(OrderInheritance)) where?: Where<OrderInheritance>,
  ): Promise<Count> {
    return this.customerInheritanceRepository.orderInheritances(id).patch(orderInheritance, where);
  }

  @del('/customer-inheritances/{id}/order-inheritances', {
    responses: {
      '200': {
        description: 'CustomerInheritance.OrderInheritance DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(OrderInheritance)) where?: Where<OrderInheritance>,
  ): Promise<Count> {
    return this.customerInheritanceRepository.orderInheritances(id).delete(where);
  }
}

`;


exports[`lb4 relation add controller to existing index file only once check if the controller exported to index file only once 1`] = `
export * from './order-customer.controller';

`;
