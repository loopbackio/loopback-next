// IMPORTANT
// This snapshot file is auto-generated, but designed for humans.
// It should be checked into source control and tracked carefully.
// Re-generate by setting UPDATE_SNAPSHOTS=1 and running tests.
// Make sure to inspect the changes in the snapshots below.
// Do not ignore changes!

'use strict';

exports[`lb4 relation checks generated repository with registerInclusionResolver set to false in --config generated repository file should not have inclusion resolver registered 1`] = `
import {DefaultCrudRepository, BelongsToAccessor, repository} from '@loopback/repository';
import {Order, Customer} from '../models';
import {DbDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {CustomerRepository} from './customer.repository';

export class OrderRepository extends DefaultCrudRepository<
  Order,
  typeof Order.prototype.id
> {
  public readonly myCustomer: BelongsToAccessor<
    Customer,
    typeof Order.prototype.id
  >;

  public readonly custom_name: BelongsToAccessor<Customer, typeof Order.prototype.id>;

  constructor(@inject('datasources.db') dataSource: DbDataSource, @repository.getter('CustomerRepository') protected customerRepositoryGetter: Getter<CustomerRepository>,) {
    super(Order, dataSource);
    this.custom_name = this.createBelongsToAccessorFor('custom_name', customerRepositoryGetter,);
  }
}

`;


exports[`lb4 relation checks generated repository with registerInclusionResolver set to true in --config generated repository file should have inclusion resolver registered 1`] = `
import {DefaultCrudRepository, BelongsToAccessor, repository} from '@loopback/repository';
import {Order, Customer} from '../models';
import {DbDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {CustomerRepository} from './customer.repository';

export class OrderRepository extends DefaultCrudRepository<
  Order,
  typeof Order.prototype.id
> {
  public readonly myCustomer: BelongsToAccessor<
    Customer,
    typeof Order.prototype.id
  >;

  public readonly custom_name: BelongsToAccessor<Customer, typeof Order.prototype.id>;

  constructor(@inject('datasources.db') dataSource: DbDataSource, @repository.getter('CustomerRepository') protected customerRepositoryGetter: Getter<CustomerRepository>,) {
    super(Order, dataSource);
    this.custom_name = this.createBelongsToAccessorFor('custom_name', customerRepositoryGetter,);
    this.registerInclusionResolver('custom_name', this.custom_name.inclusionResolver);
  }
}

`;


exports[`lb4 relation checks generated source class repository answers {"relationType":"belongsTo","sourceModel":"Order","destinationModel":"Customer","relationName":"custom_name","registerInclusionResolver":false} generates Order repository file with different inputs 1`] = `
import {DefaultCrudRepository, BelongsToAccessor, repository} from '@loopback/repository';
import {Order, Customer} from '../models';
import {DbDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {CustomerRepository} from './customer.repository';

export class OrderRepository extends DefaultCrudRepository<
  Order,
  typeof Order.prototype.id
> {
  public readonly myCustomer: BelongsToAccessor<
    Customer,
    typeof Order.prototype.id
  >;

  public readonly custom_name: BelongsToAccessor<Customer, typeof Order.prototype.id>;

  constructor(@inject('datasources.db') dataSource: DbDataSource, @repository.getter('CustomerRepository') protected customerRepositoryGetter: Getter<CustomerRepository>,) {
    super(Order, dataSource);
    this.custom_name = this.createBelongsToAccessorFor('custom_name', customerRepositoryGetter,);
  }
}

`;


exports[`lb4 relation checks generated source class repository answers {"relationType":"belongsTo","sourceModel":"Order","destinationModel":"Customer"} generates Order repository file with different inputs 1`] = `
import {DefaultCrudRepository, BelongsToAccessor, repository} from '@loopback/repository';
import {Order, Customer} from '../models';
import {DbDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {CustomerRepository} from './customer.repository';

export class OrderRepository extends DefaultCrudRepository<
  Order,
  typeof Order.prototype.id
> {
  public readonly myCustomer: BelongsToAccessor<
    Customer,
    typeof Order.prototype.id
  >;

  public readonly customer: BelongsToAccessor<Customer, typeof Order.prototype.id>;

  constructor(@inject('datasources.db') dataSource: DbDataSource, @repository.getter('CustomerRepository') protected customerRepositoryGetter: Getter<CustomerRepository>,) {
    super(Order, dataSource);
    this.customer = this.createBelongsToAccessorFor('customer', customerRepositoryGetter,);
    this.registerInclusionResolver('customer', this.customer.inclusionResolver);
  }
}

`;


exports[`lb4 relation checks generated source class repository for same table relation answers {"relationType":"belongsTo","sourceModel":"Employee","destinationModel":"Employee"} generates Employee repository file with different inputs 1`] = `
import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Employee} from '../models';

export class EmployeeRepository extends DefaultCrudRepository<
  Employee,
  typeof Employee.prototype.id
> {

  public readonly employee: BelongsToAccessor<Employee, typeof Employee.prototype.id>;

  constructor(@inject('datasources.db') dataSource: DbDataSource, @repository.getter('EmployeeRepository') protected employeeRepositoryGetter: Getter<EmployeeRepository>,) {
    super(Employee, dataSource);
    this.employee = this.createBelongsToAccessorFor('employee', employeeRepositoryGetter,);
    this.registerInclusionResolver('employee', this.employee.inclusionResolver);
  }
}

`;


exports[`lb4 relation checks if the controller file created  answers {"relationType":"belongsTo","sourceModel":"Order","destinationModel":"Customer","relationName":"my_customer"} checks controller content with belongsTo relation 1`] = `
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
            schema: getModelSchemaRef(Customer),
          },
        },
      },
    },
  })
  async getCustomer(
    @param.path.number('id') id: typeof Order.prototype.id,
  ): Promise<Customer> {
    return this.orderRepository.my_customer(id);
  }
}

`;


exports[`lb4 relation checks if the controller file created  answers {"relationType":"belongsTo","sourceModel":"Order","destinationModel":"Customer","relationName":"my_customer"} the new controller file added to index.ts file 1`] = `
export * from './order-customer.controller';

`;


exports[`lb4 relation checks if the controller file created  answers {"relationType":"belongsTo","sourceModel":"Order","destinationModel":"Customer"} checks controller content with belongsTo relation 1`] = `
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
            schema: getModelSchemaRef(Customer),
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


exports[`lb4 relation checks if the controller file created  answers {"relationType":"belongsTo","sourceModel":"Order","destinationModel":"Customer"} the new controller file added to index.ts file 1`] = `
export * from './order-customer.controller';

`;


exports[`lb4 relation checks if the controller file created for multiple relations answers {"relationType":"belongsTo","sourceModel":"Task","destinationModel":"Employee","relationName":"assignedTo"} checks controller content with belongsTo relation for multiple relations 1`] = `
import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Task,
  Employee,
} from '../models';
import {TaskRepository} from '../repositories';

export class TaskEmployeeController {
  constructor(
    @repository(TaskRepository)
    public taskRepository: TaskRepository,
  ) { }

  @get('/tasks/{id}/employee', {
    responses: {
      '200': {
        description: 'Employee belonging to Task',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Employee),
          },
        },
      },
    },
  })
  async getEmployee(
    @param.path.number('id') id: typeof Task.prototype.id,
  ): Promise<Employee> {
    return this.taskRepository.assignedTo(id);
  }
}

`;


exports[`lb4 relation checks if the controller file created for multiple relations answers {"relationType":"belongsTo","sourceModel":"Task","destinationModel":"Employee","relationName":"createdBy"} checks controller content with belongsTo relation for multiple relations 1`] = `
import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Task,
  Employee,
} from '../models';
import {TaskRepository} from '../repositories';

export class TaskEmployeeController {
  constructor(
    @repository(TaskRepository)
    public taskRepository: TaskRepository,
  ) { }

  @get('/tasks/{id}/employee', {
    responses: {
      '200': {
        description: 'Employee belonging to Task',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Employee),
          },
        },
      },
    },
  })
  async getEmployee(
    @param.path.number('id') id: typeof Task.prototype.id,
  ): Promise<Employee> {
    return this.taskRepository.createdBy(id);
  }
}

`;


exports[`lb4 relation checks if the controller file created for same table relation answers {"relationType":"belongsTo","sourceModel":"Employee","destinationModel":"Employee"} checks controller content with belongsTo relation with same table 1`] = `
export class EmployeeController {}

`;


exports[`lb4 relation checks if the controller file created for same table relation answers {"relationType":"belongsTo","sourceModel":"Employee","destinationModel":"Employee"} the new controller file added to index.ts file 1`] = `
export * from './employee-employee.controller';

`;


exports[`lb4 relation generates model relation for existing property name verifies that a preexisting property will be overwritten 1`] = `
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


exports[`lb4 relation generates model relation with custom relation name answers {"relationType":"belongsTo","sourceModel":"Order","destinationModel":"Customer","foreignKeyName":"customerId","relationName":"my_customer"} relation name should be my_customer 1`] = `
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

  @belongsTo(() => Customer, {name: 'my_customer'})
  customerId: number;

  constructor(data?: Partial<Order>) {
    super(data);
  }
}

`;


exports[`lb4 relation generates model relation with default values answers {"relationType":"belongsTo","sourceModel":"Order","destinationModel":"Customer"} has correct default imports 1`] = `
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


exports[`lb4 relation generates model relation with same table with default foreignKeyName verifies that a preexisting property will be overwritten 1`] = `
import {Entity, model, property, belongsTo} from '@loopback/repository';

@model()
export class Employee extends Entity {
  @property({
    type: 'number',
    id: true,
    default: 0,
  })
  id?: number;

  @property({
    type: 'string',
  })
  firstName?: string;

  @property({
    type: 'string',
  })
  lastName?: string;

  @property({
    type: 'number',
  })
  reportsTo?: string;

  @belongsTo(() => Employee, {name: 'reportsToEemployee'})
  employeeId: number;

  constructor(data?: Partial<Employee>) {
    super(data);
  }
}

`;
