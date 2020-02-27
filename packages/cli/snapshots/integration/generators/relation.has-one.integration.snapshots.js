// IMPORTANT
// This snapshot file is auto-generated, but designed for humans.
// It should be checked into source control and tracked carefully.
// Re-generate by setting UPDATE_SNAPSHOTS=1 and running tests.
// Make sure to inspect the changes in the snapshots below.
// Do not ignore changes!

'use strict';

exports[`lb4 relation HasOne checks generated source class repository answers {"relationType":"hasOne","sourceModel":"Customer","destinationModel":"Address"} generates Customer repository file with different inputs 1`] = `
import {DefaultCrudRepository, repository, HasOneRepositoryFactory} from '@loopback/repository';
import {Customer, Address} from '../models';
import {DbDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
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


exports[`lb4 relation HasOne checks generated source class repository answers {"relationType":"hasOne","sourceModel":"CustomerClass","destinationModel":"AddressClass","registerInclusionResolver":true} generates CustomerClass repository file with different inputs 1`] = `
import {DefaultCrudRepository, repository, HasOneRepositoryFactory} from '@loopback/repository';
import {CustomerClass, AddressClass} from '../models';
import {MyDBDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {AddressClassRepository} from './address-class.repository';

export class CustomerClassRepository extends DefaultCrudRepository<
  CustomerClass,
  typeof CustomerClass.prototype.custNumber
> {

  public readonly addressClass: HasOneRepositoryFactory<AddressClass, typeof CustomerClass.prototype.custNumber>;

  constructor(@inject('datasources.myDB') dataSource: MyDBDataSource, @repository.getter('AddressClassRepository') protected addressClassRepositoryGetter: Getter<AddressClassRepository>,) {
    super(CustomerClass, dataSource);
    this.addressClass = this.createHasOneRepositoryFactoryFor('addressClass', addressClassRepositoryGetter);
    this.registerInclusionResolver('addressClass', this.addressClass.inclusionResolver);
  }
}

`;


exports[`lb4 relation HasOne checks generated source class repository answers {"relationType":"hasOne","sourceModel":"CustomerClassType","destinationModel":"AddressClassType","registerInclusionResolver":false} generates CustomerClassType repository file with different inputs 1`] = `
import {DefaultCrudRepository, repository, HasOneRepositoryFactory} from '@loopback/repository';
import {CustomerClassType, AddressClassType} from '../models';
import {MyDBDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {AddressClassTypeRepository} from './address-class-type.repository';

export class CustomerClassTypeRepository extends DefaultCrudRepository<
  CustomerClassType,
  typeof CustomerClassType.prototype.custNumber
> {

  public readonly addressClassType: HasOneRepositoryFactory<AddressClassType, typeof CustomerClassType.prototype.custNumber>;

  constructor(@inject('datasources.myDB') dataSource: MyDBDataSource, @repository.getter('AddressClassTypeRepository') protected addressClassTypeRepositoryGetter: Getter<AddressClassTypeRepository>,) {
    super(CustomerClassType, dataSource);
    this.addressClassType = this.createHasOneRepositoryFactoryFor('addressClassType', addressClassTypeRepositoryGetter);
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


exports[`lb4 relation HasOne checks if the controller file created  answers {"relationType":"hasOne","sourceModel":"CustomerClass","destinationModel":"AddressClass","relationName":"myAddress"} checks controller content with hasOne relation 1`] = `
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
  AddressClass,
} from '../models';
import {CustomerClassRepository} from '../repositories';

export class CustomerClassAddressClassController {
  constructor(
    @repository(CustomerClassRepository) protected customerClassRepository: CustomerClassRepository,
  ) { }

  @get('/customer-classes/{id}/address-class', {
    responses: {
      '200': {
        description: 'CustomerClass has one AddressClass',
        content: {
          'application/json': {
            schema: getModelSchemaRef(AddressClass),
          },
        },
      },
    },
  })
  async get(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<AddressClass>,
  ): Promise<AddressClass> {
    return this.customerClassRepository.myAddress(id).get(filter);
  }

  @post('/customer-classes/{id}/address-class', {
    responses: {
      '200': {
        description: 'CustomerClass model instance',
        content: {'application/json': {schema: getModelSchemaRef(AddressClass)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof CustomerClass.prototype.custNumber,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(AddressClass, {
            title: 'NewAddressClassInCustomerClass',
            exclude: ['addressNumber'],
            optional: ['customerClassId']
          }),
        },
      },
    }) addressClass: Omit<AddressClass, 'addressNumber'>,
  ): Promise<AddressClass> {
    return this.customerClassRepository.myAddress(id).create(addressClass);
  }

  @patch('/customer-classes/{id}/address-class', {
    responses: {
      '200': {
        description: 'CustomerClass.AddressClass PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(AddressClass, {partial: true}),
        },
      },
    })
    addressClass: Partial<AddressClass>,
    @param.query.object('where', getWhereSchemaFor(AddressClass)) where?: Where<AddressClass>,
  ): Promise<Count> {
    return this.customerClassRepository.myAddress(id).patch(addressClass, where);
  }

  @del('/customer-classes/{id}/address-class', {
    responses: {
      '200': {
        description: 'CustomerClass.AddressClass DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(AddressClass)) where?: Where<AddressClass>,
  ): Promise<Count> {
    return this.customerClassRepository.myAddress(id).delete(where);
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


exports[`lb4 relation HasOne generates model relation with custom foreignKey answers {"relationType":"hasOne","sourceModel":"CustomerClass","destinationModel":"AddressClass","foreignKeyName":"mykey"} add the keyTo to the source model 1`] = `
import {Entity, model, property, hasOne} from '@loopback/repository';
import {AddressClass} from './address-class.model';

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

  @hasOne(() => AddressClass, {keyTo: 'mykey'})
  addressClass: AddressClass;

  constructor(data?: Partial<CustomerClass>) {
    super(data);
  }
}

`;


exports[`lb4 relation HasOne generates model relation with custom foreignKey answers {"relationType":"hasOne","sourceModel":"CustomerClass","destinationModel":"AddressClass","foreignKeyName":"mykey"} add the keyTo to the source model 2`] = `
import {Entity, model, property} from '@loopback/repository';

@model()
export class AddressClass extends Entity {
  @property({
    type: 'number',
    id: true,
  })
  addressNumber?: number;

  @property({
    type: 'string',
  })
  name?: string;

  @property({
    type: 'number',
  })
  mykey?: number;

  constructor(data?: Partial<AddressClass>) {
    super(data);
  }
}

`;


exports[`lb4 relation HasOne generates model relation with custom foreignKey answers {"relationType":"hasOne","sourceModel":"CustomerClassType","destinationModel":"AddressClassType","foreignKeyName":"mykey"} add the keyTo to the source model 1`] = `
import {Entity, model, property, hasOne} from '@loopback/repository';
import {AddressClassType} from './address-class-type.model';

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

  @hasOne(() => AddressClassType, {keyTo: 'mykey'})
  addressClassType: AddressClassType;

  constructor(data?: Partial<CustomerClassType>) {
    super(data);
  }
}

`;


exports[`lb4 relation HasOne generates model relation with custom foreignKey answers {"relationType":"hasOne","sourceModel":"CustomerClassType","destinationModel":"AddressClassType","foreignKeyName":"mykey"} add the keyTo to the source model 2`] = `
import {Entity, model, property} from '@loopback/repository';

@model()
export class AddressClassType extends Entity {
  @property({
    type: 'string',
    id: true,
  })
  addressString: string;

  @property({
    type: 'string',
  })
  name?: string;

  @property({
    type: 'number',
  })
  mykey?: number;

  constructor(data?: Partial<AddressClassType>) {
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


exports[`lb4 relation HasOne generates model relation with custom relation name answers {"relationType":"hasOne","sourceModel":"CustomerClass","destinationModel":"AddressClass","relationName":"myAddress"} relation name should be myAddress 1`] = `
import {Entity, model, property, hasOne} from '@loopback/repository';
import {AddressClass} from './address-class.model';

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

  @hasOne(() => AddressClass)
  myAddress: AddressClass;

  constructor(data?: Partial<CustomerClass>) {
    super(data);
  }
}

`;


exports[`lb4 relation HasOne generates model relation with custom relation name answers {"relationType":"hasOne","sourceModel":"CustomerClass","destinationModel":"AddressClass","relationName":"myAddress"} relation name should be myAddress 2`] = `
import {Entity, model, property} from '@loopback/repository';

@model()
export class AddressClass extends Entity {
  @property({
    type: 'number',
    id: true,
  })
  addressNumber?: number;

  @property({
    type: 'string',
  })
  name?: string;

  @property({
    type: 'number',
  })
  customerClassId?: number;

  constructor(data?: Partial<AddressClass>) {
    super(data);
  }
}

`;


exports[`lb4 relation HasOne generates model relation with custom relation name answers {"relationType":"hasOne","sourceModel":"CustomerClassType","destinationModel":"AddressClassType","relationName":"myAddress"} relation name should be myAddress 1`] = `
import {Entity, model, property, hasOne} from '@loopback/repository';
import {AddressClassType} from './address-class-type.model';

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

  @hasOne(() => AddressClassType)
  myAddress: AddressClassType;

  constructor(data?: Partial<CustomerClassType>) {
    super(data);
  }
}

`;


exports[`lb4 relation HasOne generates model relation with custom relation name answers {"relationType":"hasOne","sourceModel":"CustomerClassType","destinationModel":"AddressClassType","relationName":"myAddress"} relation name should be myAddress 2`] = `
import {Entity, model, property} from '@loopback/repository';

@model()
export class AddressClassType extends Entity {
  @property({
    type: 'string',
    id: true,
  })
  addressString: string;

  @property({
    type: 'string',
  })
  name?: string;

  @property({
    type: 'number',
  })
  customerClassTypeId?: number;

  constructor(data?: Partial<AddressClassType>) {
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


exports[`lb4 relation HasOne generates model relation with default values answers {"relationType":"hasOne","sourceModel":"CustomerClass","destinationModel":"AddressClass"} has correct default imports 1`] = `
import {Entity, model, property, hasOne} from '@loopback/repository';
import {AddressClass} from './address-class.model';

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

  @hasOne(() => AddressClass)
  addressClass: AddressClass;

  constructor(data?: Partial<CustomerClass>) {
    super(data);
  }
}

`;


exports[`lb4 relation HasOne generates model relation with default values answers {"relationType":"hasOne","sourceModel":"CustomerClassType","destinationModel":"AddressClassType"} has correct default imports 1`] = `
import {Entity, model, property, hasOne} from '@loopback/repository';
import {AddressClassType} from './address-class-type.model';

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

  @hasOne(() => AddressClassType)
  addressClassType: AddressClassType;

  constructor(data?: Partial<CustomerClassType>) {
    super(data);
  }
}

`;
