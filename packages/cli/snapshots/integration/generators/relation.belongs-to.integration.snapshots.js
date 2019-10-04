// IMPORTANT
// This snapshot file is auto-generated, but designed for humans.
// It should be checked into source control and tracked carefully.
// Re-generate by setting UPDATE_SNAPSHOTS=1 and running tests.
// Make sure to inspect the changes in the snapshots below.
// Do not ignore changes!

'use strict';

exports[`lb4 relation check if the controller file created  answers {"relationType":"belongsTo","sourceModel":"Order","destinationModel":"Customer"} controller GET Array of Order's belonging to Customer 1`] = `
import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Order,
  Customer,
} from '../models';
import {OrderRepository} from '../repositories';

export class OrderCustomerController {
  constructor(
    @repository(OrderRepository)
    public orderRepository: OrderRepository,
  ) { }

  @get('/orders/{id}/customer', {
    responses: {
      '200': {
        description: 'Customer belonging to Order',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Customer)},
          },
        },
      },
    },
  })
  async getCustomer(
    @param.path.number('id') id: typeof Order.prototype.id,
  ): Promise<Customer> {
    return this.orderRepository.customer(id);
  }
}

`;


exports[`lb4 relation check if the controller file created  answers {"relationType":"belongsTo","sourceModel":"Order","destinationModel":"Customer"} controller with belongsTo class and constructor 1`] = `
import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Order,
  Customer,
} from '../models';
import {OrderRepository} from '../repositories';

export class OrderCustomerController {
  constructor(
    @repository(OrderRepository)
    public orderRepository: OrderRepository,
  ) { }

  @get('/orders/{id}/customer', {
    responses: {
      '200': {
        description: 'Customer belonging to Order',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Customer)},
          },
        },
      },
    },
  })
  async getCustomer(
    @param.path.number('id') id: typeof Order.prototype.id,
  ): Promise<Customer> {
    return this.orderRepository.customer(id);
  }
}

`;


exports[`lb4 relation check if the controller file created  answers {"relationType":"belongsTo","sourceModel":"Order","destinationModel":"Customer"} the new controller file added to index.ts file 1`] = `
export * from './order-customer.controller';

`;


exports[`lb4 relation check if the controller file created  answers {"relationType":"belongsTo","sourceModel":"OrderClass","destinationModel":"CustomerClass"} controller GET Array of OrderClass's belonging to CustomerClass 1`] = `
import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  OrderClass,
  CustomerClass,
} from '../models';
import {OrderClassRepository} from '../repositories';

export class OrderClassCustomerClassController {
  constructor(
    @repository(OrderClassRepository)
    public orderClassRepository: OrderClassRepository,
  ) { }

  @get('/order-classes/{id}/customer-class', {
    responses: {
      '200': {
        description: 'CustomerClass belonging to OrderClass',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(CustomerClass)},
          },
        },
      },
    },
  })
  async getCustomerClass(
    @param.path.number('id') id: typeof OrderClass.prototype.orderNumber,
  ): Promise<CustomerClass> {
    return this.orderClassRepository.customerClass(id);
  }
}

`;


exports[`lb4 relation check if the controller file created  answers {"relationType":"belongsTo","sourceModel":"OrderClass","destinationModel":"CustomerClass"} controller with belongsTo class and constructor 1`] = `
import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  OrderClass,
  CustomerClass,
} from '../models';
import {OrderClassRepository} from '../repositories';

export class OrderClassCustomerClassController {
  constructor(
    @repository(OrderClassRepository)
    public orderClassRepository: OrderClassRepository,
  ) { }

  @get('/order-classes/{id}/customer-class', {
    responses: {
      '200': {
        description: 'CustomerClass belonging to OrderClass',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(CustomerClass)},
          },
        },
      },
    },
  })
  async getCustomerClass(
    @param.path.number('id') id: typeof OrderClass.prototype.orderNumber,
  ): Promise<CustomerClass> {
    return this.orderClassRepository.customerClass(id);
  }
}

`;


exports[`lb4 relation check if the controller file created  answers {"relationType":"belongsTo","sourceModel":"OrderClass","destinationModel":"CustomerClass"} the new controller file added to index.ts file 1`] = `
export * from './order-class-customer-class.controller';

`;


exports[`lb4 relation check if the controller file created  answers {"relationType":"belongsTo","sourceModel":"OrderClassType","destinationModel":"CustomerClassType"} controller GET Array of OrderClassType's belonging to CustomerClassType 1`] = `
import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  OrderClassType,
  CustomerClassType,
} from '../models';
import {OrderClassTypeRepository} from '../repositories';

export class OrderClassTypeCustomerClassTypeController {
  constructor(
    @repository(OrderClassTypeRepository)
    public orderClassTypeRepository: OrderClassTypeRepository,
  ) { }

  @get('/order-class-types/{id}/customer-class-type', {
    responses: {
      '200': {
        description: 'CustomerClassType belonging to OrderClassType',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(CustomerClassType)},
          },
        },
      },
    },
  })
  async getCustomerClassType(
    @param.path.string('id') id: typeof OrderClassType.prototype.orderString,
  ): Promise<CustomerClassType> {
    return this.orderClassTypeRepository.customerClassType(id);
  }
}

`;


exports[`lb4 relation check if the controller file created  answers {"relationType":"belongsTo","sourceModel":"OrderClassType","destinationModel":"CustomerClassType"} controller with belongsTo class and constructor 1`] = `
import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  OrderClassType,
  CustomerClassType,
} from '../models';
import {OrderClassTypeRepository} from '../repositories';

export class OrderClassTypeCustomerClassTypeController {
  constructor(
    @repository(OrderClassTypeRepository)
    public orderClassTypeRepository: OrderClassTypeRepository,
  ) { }

  @get('/order-class-types/{id}/customer-class-type', {
    responses: {
      '200': {
        description: 'CustomerClassType belonging to OrderClassType',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(CustomerClassType)},
          },
        },
      },
    },
  })
  async getCustomerClassType(
    @param.path.string('id') id: typeof OrderClassType.prototype.orderString,
  ): Promise<CustomerClassType> {
    return this.orderClassTypeRepository.customerClassType(id);
  }
}

`;


exports[`lb4 relation check if the controller file created  answers {"relationType":"belongsTo","sourceModel":"OrderClassType","destinationModel":"CustomerClassType"} the new controller file added to index.ts file 1`] = `
export * from './order-class-type-customer-class-type.controller';

`;


exports[`lb4 relation check source class repository  answers {"relationType":"belongsTo","sourceModel":"Order","destinationModel":"Customer"} Order repostitory has all imports 1`] = `
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {Order, Customer} from '../models';
import {DbDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {CustomerRepository} from './customer.repository';

export class OrderRepository extends DefaultCrudRepository<
  Order,
  typeof Order.prototype.id
> {

  public readonly customer: BelongsToAccessor<Customer, typeof Order.prototype.id>;

  constructor(@inject('datasources.db') dataSource: DbDataSource, @repository.getter('CustomerRepository') protected customerRepositoryGetter: Getter<CustomerRepository>,) {
    super(Order, dataSource);
    this.customer = this.createBelongsToAccessorFor('customer', customerRepositoryGetter,);
  }
}

`;


exports[`lb4 relation check source class repository  answers {"relationType":"belongsTo","sourceModel":"Order","destinationModel":"Customer"} repository has updated constructor 1`] = `
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {Order, Customer} from '../models';
import {DbDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {CustomerRepository} from './customer.repository';

export class OrderRepository extends DefaultCrudRepository<
  Order,
  typeof Order.prototype.id
> {

  public readonly customer: BelongsToAccessor<Customer, typeof Order.prototype.id>;

  constructor(@inject('datasources.db') dataSource: DbDataSource, @repository.getter('CustomerRepository') protected customerRepositoryGetter: Getter<CustomerRepository>,) {
    super(Order, dataSource);
    this.customer = this.createBelongsToAccessorFor('customer', customerRepositoryGetter,);
  }
}

`;


exports[`lb4 relation check source class repository  answers {"relationType":"belongsTo","sourceModel":"OrderClass","destinationModel":"CustomerClass"} OrderClass repostitory has all imports 1`] = `
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {OrderClass, CustomerClass} from '../models';
import {MyDBDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {CustomerClassRepository} from './customer-class.repository';

export class OrderClassRepository extends DefaultCrudRepository<
  OrderClass,
  typeof OrderClass.prototype.orderNumber
> {

  public readonly customerClass: BelongsToAccessor<CustomerClass, typeof OrderClass.prototype.orderNumber>;

  constructor(@inject('datasources.myDB') dataSource: MyDBDataSource, @repository.getter('CustomerClassRepository') protected customerClassRepositoryGetter: Getter<CustomerClassRepository>,) {
    super(OrderClass, dataSource);
    this.customerClass = this.createBelongsToAccessorFor('customerClassCustNumber', customerClassRepositoryGetter,);
  }
}

`;


exports[`lb4 relation check source class repository  answers {"relationType":"belongsTo","sourceModel":"OrderClass","destinationModel":"CustomerClass"} repository has updated constructor 1`] = `
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {OrderClass, CustomerClass} from '../models';
import {MyDBDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {CustomerClassRepository} from './customer-class.repository';

export class OrderClassRepository extends DefaultCrudRepository<
  OrderClass,
  typeof OrderClass.prototype.orderNumber
> {

  public readonly customerClass: BelongsToAccessor<CustomerClass, typeof OrderClass.prototype.orderNumber>;

  constructor(@inject('datasources.myDB') dataSource: MyDBDataSource, @repository.getter('CustomerClassRepository') protected customerClassRepositoryGetter: Getter<CustomerClassRepository>,) {
    super(OrderClass, dataSource);
    this.customerClass = this.createBelongsToAccessorFor('customerClassCustNumber', customerClassRepositoryGetter,);
  }
}

`;


exports[`lb4 relation check source class repository  answers {"relationType":"belongsTo","sourceModel":"OrderClassType","destinationModel":"CustomerClassType"} OrderClassType repostitory has all imports 1`] = `
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {OrderClassType, CustomerClassType} from '../models';
import {MyDBDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {CustomerClassTypeRepository} from './customer-class-type.repository';

export class OrderClassTypeRepository extends DefaultCrudRepository<
  OrderClassType,
  typeof OrderClassType.prototype.orderString
> {

  public readonly customerClassType: BelongsToAccessor<CustomerClassType, typeof OrderClassType.prototype.orderString>;

  constructor(@inject('datasources.myDB') dataSource: MyDBDataSource, @repository.getter('CustomerClassTypeRepository') protected customerClassTypeRepositoryGetter: Getter<CustomerClassTypeRepository>,) {
    super(OrderClassType, dataSource);
    this.customerClassType = this.createBelongsToAccessorFor('customerClassTypeCustNumber', customerClassTypeRepositoryGetter,);
  }
}

`;


exports[`lb4 relation check source class repository  answers {"relationType":"belongsTo","sourceModel":"OrderClassType","destinationModel":"CustomerClassType"} repository has updated constructor 1`] = `
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {OrderClassType, CustomerClassType} from '../models';
import {MyDBDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {CustomerClassTypeRepository} from './customer-class-type.repository';

export class OrderClassTypeRepository extends DefaultCrudRepository<
  OrderClassType,
  typeof OrderClassType.prototype.orderString
> {

  public readonly customerClassType: BelongsToAccessor<CustomerClassType, typeof OrderClassType.prototype.orderString>;

  constructor(@inject('datasources.myDB') dataSource: MyDBDataSource, @repository.getter('CustomerClassTypeRepository') protected customerClassTypeRepositoryGetter: Getter<CustomerClassTypeRepository>,) {
    super(OrderClassType, dataSource);
    this.customerClassType = this.createBelongsToAccessorFor('customerClassTypeCustNumber', customerClassTypeRepositoryGetter,);
  }
}

`;


exports[`lb4 relation check source class repository  generate model relation for existing property name Verify is property name that already exist will overwriting  1`] = `
import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Customer} from './customer.model';

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

  @belongsTo(() => Customer)
  myCustomer: number;

  constructor(data?: Partial<Order>) {
    super(data);
  }
}

`;


exports[`lb4 relation generate model relation answers {"relationType":"belongsTo","sourceModel":"Order","destinationModel":"Customer","relationName":"myCustomer"} add import belongsTo, import for target model and belongsTo decorator   1`] = `
import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Customer} from './customer.model';

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

  @belongsTo(() => Customer)
  myCustomer: number;

  constructor(data?: Partial<Order>) {
    super(data);
  }
}

`;


exports[`lb4 relation generate model relation answers {"relationType":"belongsTo","sourceModel":"OrderClass","destinationModel":"CustomerClass","relationName":"myCustomer"} add import belongsTo, import for target model and belongsTo decorator   1`] = `
import {Entity, model, property, belongsTo} from '@loopback/repository';
import {CustomerClass} from './customer-class.model';

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

  @belongsTo(() => CustomerClass)
  myCustomer: number;

  constructor(data?: Partial<OrderClass>) {
    super(data);
  }
}

`;


exports[`lb4 relation generate model relation answers {"relationType":"belongsTo","sourceModel":"OrderClassType","destinationModel":"CustomerClassType","relationName":"myCustomer"} add import belongsTo, import for target model and belongsTo decorator   1`] = `
import {Entity, model, property, belongsTo} from '@loopback/repository';
import {CustomerClassType} from './customer-class-type.model';

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

  @belongsTo(() => CustomerClassType)
  myCustomer: number;

  constructor(data?: Partial<OrderClassType>) {
    super(data);
  }
}

`;


exports[`lb4 relation generate model relation with custom relation name answers {"relationType":"belongsTo","sourceModel":"Order","destinationModel":"Customer","relationName":"customerPK"} relation name should be customerPK 1`] = `
import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Customer} from './customer.model';

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

  @belongsTo(() => Customer)
  customerPK: number;

  constructor(data?: Partial<Order>) {
    super(data);
  }
}

`;


exports[`lb4 relation generate model relation with custom relation name answers {"relationType":"belongsTo","sourceModel":"OrderClass","destinationModel":"CustomerClass","relationName":"customerPK"} relation name should be customerPK 1`] = `
import {Entity, model, property, belongsTo} from '@loopback/repository';
import {CustomerClass} from './customer-class.model';

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

  @belongsTo(() => CustomerClass)
  customerPK: number;

  constructor(data?: Partial<OrderClass>) {
    super(data);
  }
}

`;


exports[`lb4 relation generate model relation with custom relation name answers {"relationType":"belongsTo","sourceModel":"OrderClassType","destinationModel":"CustomerClassType","relationName":"customerPK"} relation name should be customerPK 1`] = `
import {Entity, model, property, belongsTo} from '@loopback/repository';
import {CustomerClassType} from './customer-class-type.model';

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

  @belongsTo(() => CustomerClassType)
  customerPK: number;

  constructor(data?: Partial<OrderClassType>) {
    super(data);
  }
}

`;


exports[`lb4 relation generate model relation with default relation name answers {"relationType":"belongsTo","sourceModel":"Order","destinationModel":"Customer"} relation name should be customerId 1`] = `
import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Customer} from './customer.model';

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

  @belongsTo(() => Customer)
  customerId: number;

  constructor(data?: Partial<Order>) {
    super(data);
  }
}

`;


exports[`lb4 relation generate model relation with default relation name answers {"relationType":"belongsTo","sourceModel":"OrderClass","destinationModel":"CustomerClass"} relation name should be customerClassCustNumber 1`] = `
import {Entity, model, property, belongsTo} from '@loopback/repository';
import {CustomerClass} from './customer-class.model';

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

  @belongsTo(() => CustomerClass)
  customerClassCustNumber: number;

  constructor(data?: Partial<OrderClass>) {
    super(data);
  }
}

`;


exports[`lb4 relation generate model relation with default relation name answers {"relationType":"belongsTo","sourceModel":"OrderClassType","destinationModel":"CustomerClassType"} relation name should be customerClassTypeCustNumber 1`] = `
import {Entity, model, property, belongsTo} from '@loopback/repository';
import {CustomerClassType} from './customer-class-type.model';

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

  @belongsTo(() => CustomerClassType)
  customerClassTypeCustNumber: number;

  constructor(data?: Partial<OrderClassType>) {
    super(data);
  }
}

`;
