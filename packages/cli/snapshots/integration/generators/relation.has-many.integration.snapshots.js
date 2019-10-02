// IMPORTANT
// This snapshot file is auto-generated, but designed for humans.
// It should be checked into source control and tracked carefully.
// Re-generate by setting UPDATE_SNAPSHOTS=1 and running tests.
// Make sure to inspect the changes in the snapshots below.
// Do not ignore changes!

'use strict';

exports[
  `lb4 relation HasMany checks generated source class repository answers {"relationType":"hasMany","sourceModel":"Customer","destinationModel":"Order"} generates Customer repository file with different inputs 1`
] = `
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {Customer, Order} from '../models';
import {DbDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
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

exports[
  `lb4 relation HasMany checks generated source class repository answers {"relationType":"hasMany","sourceModel":"CustomerClass","destinationModel":"OrderClass","registerInclusionResolver":true} generates CustomerClass repository file with different inputs 1`
] = `
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {CustomerClass, OrderClass} from '../models';
import {MyDBDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {OrderClassRepository} from './order-class.repository';

export class CustomerClassRepository extends DefaultCrudRepository<
  CustomerClass,
  typeof CustomerClass.prototype.custNumber
> {

  public readonly orderClasses: HasManyRepositoryFactory<OrderClass, typeof CustomerClass.prototype.custNumber>;

  constructor(@inject('datasources.myDB') dataSource: MyDBDataSource, @repository.getter('OrderClassRepository') protected orderClassRepositoryGetter: Getter<OrderClassRepository>,) {
    super(CustomerClass, dataSource);
    this.orderClasses = this.createHasManyRepositoryFactoryFor('orderClasses', orderClassRepositoryGetter,);
    this.registerInclusionResolver('orderClasses', this.orderClasses.inclusionResolver);
  }
}

`;

exports[
  `lb4 relation HasMany checks generated source class repository answers {"relationType":"hasMany","sourceModel":"CustomerClassType","destinationModel":"OrderClassType","registerInclusionResolver":false} generates CustomerClassType repository file with different inputs 1`
] = `
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {CustomerClassType, OrderClassType} from '../models';
import {MyDBDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {OrderClassTypeRepository} from './order-class-type.repository';

export class CustomerClassTypeRepository extends DefaultCrudRepository<
  CustomerClassType,
  typeof CustomerClassType.prototype.custNumber
> {

  public readonly orderClassTypes: HasManyRepositoryFactory<OrderClassType, typeof CustomerClassType.prototype.custNumber>;

  constructor(@inject('datasources.myDB') dataSource: MyDBDataSource, @repository.getter('OrderClassTypeRepository') protected orderClassTypeRepositoryGetter: Getter<OrderClassTypeRepository>,) {
    super(CustomerClassType, dataSource);
    this.orderClassTypes = this.createHasManyRepositoryFactoryFor('orderClassTypes', orderClassTypeRepositoryGetter,);
  }
}

`;

exports[
  `lb4 relation HasMany checks if the controller file created  answers {"relationType":"hasMany","sourceModel":"Customer","destinationModel":"Order"} checks controller content with hasMany relation 1`
] = `
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
        description: 'Array of Order\\'s belonging to Customer',
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

exports[
  `lb4 relation HasMany checks if the controller file created  answers {"relationType":"hasMany","sourceModel":"CustomerClass","destinationModel":"OrderClass"} checks controller content with hasMany relation 1`
] = `
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
  CustomerClass,
  OrderClass,
} from '../models';
import {CustomerClassRepository} from '../repositories';

export class CustomerClassOrderClassController {
  constructor(
    @repository(CustomerClassRepository) protected customerClassRepository: CustomerClassRepository,
  ) { }

  @get('/customer-classes/{id}/order-classes', {
    responses: {
      '200': {
        description: 'Array of OrderClass\\'s belonging to CustomerClass',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(OrderClass)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<OrderClass>,
  ): Promise<OrderClass[]> {
    return this.customerClassRepository.orderClasses(id).find(filter);
  }

  @post('/customer-classes/{id}/order-classes', {
    responses: {
      '200': {
        description: 'CustomerClass model instance',
        content: {'application/json': {schema: getModelSchemaRef(OrderClass)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof CustomerClass.prototype.custNumber,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OrderClass, {
            title: 'NewOrderClassInCustomerClass',
            exclude: ['orderNumber'],
            optional: ['customerClassCustNumber']
          }),
        },
      },
    }) orderClass: Omit<OrderClass, 'orderNumber'>,
  ): Promise<OrderClass> {
    return this.customerClassRepository.orderClasses(id).create(orderClass);
  }

  @patch('/customer-classes/{id}/order-classes', {
    responses: {
      '200': {
        description: 'CustomerClass.OrderClass PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OrderClass, {partial: true}),
        },
      },
    })
    orderClass: Partial<OrderClass>,
    @param.query.object('where', getWhereSchemaFor(OrderClass)) where?: Where<OrderClass>,
  ): Promise<Count> {
    return this.customerClassRepository.orderClasses(id).patch(orderClass, where);
  }

  @del('/customer-classes/{id}/order-classes', {
    responses: {
      '200': {
        description: 'CustomerClass.OrderClass DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(OrderClass)) where?: Where<OrderClass>,
  ): Promise<Count> {
    return this.customerClassRepository.orderClasses(id).delete(where);
  }
}

`;

exports[
  `lb4 relation HasMany checks if the controller file created  answers {"relationType":"hasMany","sourceModel":"CustomerClassType","destinationModel":"OrderClassType"} checks controller content with hasMany relation 1`
] = `
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
  CustomerClassType,
  OrderClassType,
} from '../models';
import {CustomerClassTypeRepository} from '../repositories';

export class CustomerClassTypeOrderClassTypeController {
  constructor(
    @repository(CustomerClassTypeRepository) protected customerClassTypeRepository: CustomerClassTypeRepository,
  ) { }

  @get('/customer-class-types/{id}/order-class-types', {
    responses: {
      '200': {
        description: 'Array of OrderClassType\\'s belonging to CustomerClassType',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(OrderClassType)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<OrderClassType>,
  ): Promise<OrderClassType[]> {
    return this.customerClassTypeRepository.orderClassTypes(id).find(filter);
  }

  @post('/customer-class-types/{id}/order-class-types', {
    responses: {
      '200': {
        description: 'CustomerClassType model instance',
        content: {'application/json': {schema: getModelSchemaRef(OrderClassType)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof CustomerClassType.prototype.custNumber,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OrderClassType, {
            title: 'NewOrderClassTypeInCustomerClassType',
            exclude: ['orderString'],
            optional: ['customerClassTypeCustNumber']
          }),
        },
      },
    }) orderClassType: Omit<OrderClassType, 'orderString'>,
  ): Promise<OrderClassType> {
    return this.customerClassTypeRepository.orderClassTypes(id).create(orderClassType);
  }

  @patch('/customer-class-types/{id}/order-class-types', {
    responses: {
      '200': {
        description: 'CustomerClassType.OrderClassType PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OrderClassType, {partial: true}),
        },
      },
    })
    orderClassType: Partial<OrderClassType>,
    @param.query.object('where', getWhereSchemaFor(OrderClassType)) where?: Where<OrderClassType>,
  ): Promise<Count> {
    return this.customerClassTypeRepository.orderClassTypes(id).patch(orderClassType, where);
  }

  @del('/customer-class-types/{id}/order-class-types', {
    responses: {
      '200': {
        description: 'CustomerClassType.OrderClassType DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(OrderClassType)) where?: Where<OrderClassType>,
  ): Promise<Count> {
    return this.customerClassTypeRepository.orderClassTypes(id).delete(where);
  }
}

`;

exports[
  `lb4 relation HasMany generates model relation with custom foreignKey answers {"relationType":"hasMany","sourceModel":"Customer","destinationModel":"Order","foreignKeyName":"mykey"} add the keyTo to the source model 1`
] = `
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

exports[
  `lb4 relation HasMany generates model relation with custom foreignKey answers {"relationType":"hasMany","sourceModel":"Customer","destinationModel":"Order","foreignKeyName":"mykey"} add the keyTo to the source model 2`
] = `
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

exports[
  `lb4 relation HasMany generates model relation with custom foreignKey answers {"relationType":"hasMany","sourceModel":"CustomerClass","destinationModel":"OrderClass","foreignKeyName":"mykey"} add the keyTo to the source model 1`
] = `
import {Entity, model, property, hasMany} from '@loopback/repository';
import {OrderClass} from './order-class.model';

@model()
export class CustomerClass extends Entity {
  @property({
    type: 'number',
    id: true,
  })
  custNumber?: number;

  @property({
    type: 'string',
  })
  name?: string;

  @hasMany(() => OrderClass, {keyTo: 'mykey'})
  orderClasses: OrderClass[];

  constructor(data?: Partial<CustomerClass>) {
    super(data);
  }
}

`;

exports[
  `lb4 relation HasMany generates model relation with custom foreignKey answers {"relationType":"hasMany","sourceModel":"CustomerClass","destinationModel":"OrderClass","foreignKeyName":"mykey"} add the keyTo to the source model 2`
] = `
import {Entity, model, property} from '@loopback/repository';

@model()
export class OrderClass extends Entity {
  @property({
    type: 'number',
    id: true,
  })
  orderNumber?: number;

  @property({
    type: 'string',
  })
  name?: string;

  @property({
    type: 'number',
  })
  mykey?: number;

  constructor(data?: Partial<OrderClass>) {
    super(data);
  }
}

`;

exports[
  `lb4 relation HasMany generates model relation with custom foreignKey answers {"relationType":"hasMany","sourceModel":"CustomerClassType","destinationModel":"OrderClassType","foreignKeyName":"mykey"} add the keyTo to the source model 1`
] = `
import {Entity, model, property, hasMany} from '@loopback/repository';
import {OrderClassType} from './order-class-type.model';

@model()
export class CustomerClassType extends Entity {
  @property({
    type: 'number',
    id: true,
  })
  custNumber: number;

  @property({
    type: 'string',
  })
  name?: string;

  @hasMany(() => OrderClassType, {keyTo: 'mykey'})
  orderClassTypes: OrderClassType[];

  constructor(data?: Partial<CustomerClassType>) {
    super(data);
  }
}

`;

exports[
  `lb4 relation HasMany generates model relation with custom foreignKey answers {"relationType":"hasMany","sourceModel":"CustomerClassType","destinationModel":"OrderClassType","foreignKeyName":"mykey"} add the keyTo to the source model 2`
] = `
import {Entity, model, property} from '@loopback/repository';

@model()
export class OrderClassType extends Entity {
  @property({
    type: 'string',
    id: true,
  })
  orderString: string;

  @property({
    type: 'string',
  })
  name?: string;

  @property({
    type: 'number',
  })
  mykey?: number;

  constructor(data?: Partial<OrderClassType>) {
    super(data);
  }
}

`;

exports[
  `lb4 relation HasMany generates model relation with custom relation name answers {"relationType":"hasMany","sourceModel":"Customer","destinationModel":"Order","relationName":"myOrders"} relation name should be myOrders 1`
] = `
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

exports[
  `lb4 relation HasMany generates model relation with custom relation name answers {"relationType":"hasMany","sourceModel":"Customer","destinationModel":"Order","relationName":"myOrders"} relation name should be myOrders 2`
] = `
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

exports[
  `lb4 relation HasMany generates model relation with custom relation name answers {"relationType":"hasMany","sourceModel":"CustomerClass","destinationModel":"OrderClass","relationName":"myOrders"} relation name should be myOrders 1`
] = `
import {Entity, model, property, hasMany} from '@loopback/repository';
import {OrderClass} from './order-class.model';

@model()
export class CustomerClass extends Entity {
  @property({
    type: 'number',
    id: true,
  })
  custNumber?: number;

  @property({
    type: 'string',
  })
  name?: string;

  @hasMany(() => OrderClass, {keyTo: 'customerClassCustNumber'})
  myOrders: OrderClass[];

  constructor(data?: Partial<CustomerClass>) {
    super(data);
  }
}

`;

exports[
  `lb4 relation HasMany generates model relation with custom relation name answers {"relationType":"hasMany","sourceModel":"CustomerClass","destinationModel":"OrderClass","relationName":"myOrders"} relation name should be myOrders 2`
] = `
import {Entity, model, property} from '@loopback/repository';

@model()
export class OrderClass extends Entity {
  @property({
    type: 'number',
    id: true,
  })
  orderNumber?: number;

  @property({
    type: 'string',
  })
  name?: string;

  @property({
    type: 'number',
  })
  customerClassCustNumber?: number;

  constructor(data?: Partial<OrderClass>) {
    super(data);
  }
}

`;

exports[
  `lb4 relation HasMany generates model relation with custom relation name answers {"relationType":"hasMany","sourceModel":"CustomerClassType","destinationModel":"OrderClassType","relationName":"myOrders"} relation name should be myOrders 1`
] = `
import {Entity, model, property, hasMany} from '@loopback/repository';
import {OrderClassType} from './order-class-type.model';

@model()
export class CustomerClassType extends Entity {
  @property({
    type: 'number',
    id: true,
  })
  custNumber: number;

  @property({
    type: 'string',
  })
  name?: string;

  @hasMany(() => OrderClassType, {keyTo: 'customerClassTypeCustNumber'})
  myOrders: OrderClassType[];

  constructor(data?: Partial<CustomerClassType>) {
    super(data);
  }
}

`;

exports[
  `lb4 relation HasMany generates model relation with custom relation name answers {"relationType":"hasMany","sourceModel":"CustomerClassType","destinationModel":"OrderClassType","relationName":"myOrders"} relation name should be myOrders 2`
] = `
import {Entity, model, property} from '@loopback/repository';

@model()
export class OrderClassType extends Entity {
  @property({
    type: 'string',
    id: true,
  })
  orderString: string;

  @property({
    type: 'string',
  })
  name?: string;

  @property({
    type: 'number',
  })
  customerClassTypeCustNumber?: number;

  constructor(data?: Partial<OrderClassType>) {
    super(data);
  }
}

`;

exports[
  `lb4 relation HasMany generates model relation with default values answers {"relationType":"hasMany","sourceModel":"Customer","destinationModel":"Order"} has correct default imports 1`
] = `
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

exports[
  `lb4 relation HasMany generates model relation with default values answers {"relationType":"hasMany","sourceModel":"CustomerClass","destinationModel":"OrderClass"} has correct default imports 1`
] = `
import {Entity, model, property, hasMany} from '@loopback/repository';
import {OrderClass} from './order-class.model';

@model()
export class CustomerClass extends Entity {
  @property({
    type: 'number',
    id: true,
  })
  custNumber?: number;

  @property({
    type: 'string',
  })
  name?: string;

  @hasMany(() => OrderClass, {keyTo: 'customerClassCustNumber'})
  orderClasses: OrderClass[];

  constructor(data?: Partial<CustomerClass>) {
    super(data);
  }
}

`;

exports[
  `lb4 relation HasMany generates model relation with default values answers {"relationType":"hasMany","sourceModel":"CustomerClassType","destinationModel":"OrderClassType"} has correct default imports 1`
] = `
import {Entity, model, property, hasMany} from '@loopback/repository';
import {OrderClassType} from './order-class-type.model';

@model()
export class CustomerClassType extends Entity {
  @property({
    type: 'number',
    id: true,
  })
  custNumber: number;

  @property({
    type: 'string',
  })
  name?: string;

  @hasMany(() => OrderClassType, {keyTo: 'customerClassTypeCustNumber'})
  orderClassTypes: OrderClassType[];

  constructor(data?: Partial<CustomerClassType>) {
    super(data);
  }
}

`;
