// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  BelongsToDefinition,
  Entity,
  HasManyDefinition,
  ModelDefinition,
  rejectNavigationalPropertiesInData,
  RelationType,
  STRING,
} from '../../../';

describe('model', () => {
  const customerDef = new ModelDefinition('Customer');
  customerDef
    .addProperty('id', 'string')
    .addProperty('email', 'string')
    .addProperty('firstName', String)
    .addProperty('lastName', STRING)
    .addProperty('address', 'object')
    .addProperty('phones', 'array')
    .addProperty('createdAt', Date)
    .addSetting('id', 'id');

  const realmCustomerDef = new ModelDefinition('RealmCustomer');
  realmCustomerDef
    .addProperty('realm', 'string')
    .addProperty('email', 'string')
    .addProperty('firstName', String)
    .addProperty('lastName', STRING)
    .addSetting('id', ['realm', 'email']);

  const userDef = new ModelDefinition('User');
  userDef
    .addProperty('id', {type: 'string', id: true})
    .addProperty('email', 'string')
    .addProperty('password', 'string')
    .addProperty('firstName', String)
    .addProperty('lastName', STRING)
    .addSetting('hiddenProperties', ['password']);

  const flexibleDef = new ModelDefinition('Flexible');
  flexibleDef
    .addProperty('id', {type: 'string', id: true})
    .addProperty('createdAt', Date)
    .addSetting('hiddenProperties', ['createdAt'])
    .addSetting('strict', false);

  const addressDef = new ModelDefinition('Address');
  addressDef
    .addProperty('street', 'string')
    .addProperty('city', 'string')
    .addProperty('state', String)
    .addProperty('zipCode', STRING);

  class Address extends Entity {
    static definition = addressDef;
    street: string;
    city: string;
    state: string;
    zipCode: string;

    constructor(data?: Partial<Address>) {
      super(data);
    }
  }

  const phoneDef = new ModelDefinition('Phone');
  phoneDef.addProperty('number', 'string').addProperty('label', 'string');

  class Phone extends Entity {
    static definition = phoneDef;
    number: string;
    label: string;

    constructor(data?: Partial<Phone>) {
      super(data);
    }
  }

  class Customer extends Entity {
    static definition = customerDef;
    id: string;
    email?: string;
    firstName: string;
    lastName: string;
    createdAt?: Date;
    address?: Address;
    phones?: Phone[];

    constructor(data?: Partial<Customer>) {
      super(data);
    }
  }

  class RealmCustomer extends Entity {
    static definition = realmCustomerDef;
    realm: string;
    email: string;
    firstName: string;
    lastName: string;

    constructor(data?: Partial<RealmCustomer>) {
      super(data);
    }
  }

  class User extends Entity {
    static definition = userDef;
    id: string;
    email: string;
    password: string;
    firstName: string;

    constructor(data?: Partial<User>) {
      super(data);
    }
  }

  class Flexible extends Entity {
    static definition = flexibleDef;
    id: string;
    createdAt?: Date;

    constructor(data?: Partial<Flexible>) {
      super(data);
    }
  }

  function createCustomer() {
    const customer = new Customer();
    customer.id = '123';
    customer.email = 'xyz@example.com';
    return customer;
  }

  function createCustomerWithContact() {
    const customer = new Customer();
    customer.id = '123';
    customer.email = 'xyz@example.com';
    customer.address = new Address({
      street: '123 A St',
      city: 'San Jose',
      state: 'CA',
      zipCode: '95131',
    });
    customer.phones = [
      new Phone({label: 'home', number: '111-222-3333'}),
      new Phone({label: 'work', number: '111-222-5555'}),
    ];
    return customer;
  }

  function createCustomerWithContactAndDate(date: Date) {
    const customer = new Customer();
    customer.id = '123';
    customer.email = 'xyz@example.com';
    customer.createdAt = date;
    customer.address = new Address({
      street: '123 A St',
      city: 'San Jose',
      state: 'CA',
      zipCode: '95131',
    });
    customer.phones = [
      new Phone({label: 'home', number: '111-222-3333'}),
      new Phone({label: 'work', number: '111-222-5555'}),
    ];
    return customer;
  }

  function createRealmCustomer() {
    const customer = new RealmCustomer();
    customer.realm = 'org1';
    customer.email = 'xyz@example.com';
    return customer;
  }

  function createUser() {
    const user = new User();
    user.id = '123';
    user.email = 'xyz@example.com';
    user.password = '1234test';
    user.firstName = 'Test User';
    return user;
  }

  it('adds properties', () => {
    expect(customerDef.name).to.eql('Customer');
    expect(customerDef.properties).have.properties(
      'id',
      'email',
      'lastName',
      'firstName',
    );
    expect(customerDef.properties.lastName).to.eql({type: STRING});
  });

  it('adds settings', () => {
    expect(customerDef.settings).have.property('id', 'id');
  });

  it('lists id properties', () => {
    expect(customerDef.idProperties()).to.eql(['id']);
    expect(userDef.idProperties()).to.eql(['id']);
    expect(realmCustomerDef.idProperties()).to.eql(['realm', 'email']);
  });

  it('converts to json', () => {
    const customer = createCustomer();
    Object.assign(customer, {extra: 'additional data'});
    expect(customer.toJSON()).to.eql({id: '123', email: 'xyz@example.com'});
    // notice that "extra" property was discarded from the output
  });

  it('skips properties with undefined values', () => {
    const customer = createCustomer();
    delete customer.email;
    expect(customer.toJSON()).to.eql({id: '123'});
  });

  it('converts to json recursively', () => {
    const customer = createCustomerWithContact();
    expect(customer.toJSON()).to.eql({
      id: '123',
      email: 'xyz@example.com',
      address: {
        street: '123 A St',
        city: 'San Jose',
        state: 'CA',
        zipCode: '95131',
      },
      phones: [
        {label: 'home', number: '111-222-3333'},
        {label: 'work', number: '111-222-5555'},
      ],
    });
  });

  it('includes navigational properties in JSON (strict-mode)', () => {
    class Category extends Entity {
      id: number;
      products: Product[];

      constructor(data: Partial<Category>) {
        super(data);
      }
    }

    class Product extends Entity {
      id: number;
      categoryId: number;

      constructor(data: Partial<Product>) {
        super(data);
      }
    }

    Category.definition = new ModelDefinition('Category')
      .addSetting('strict', true)
      .addProperty('id', {type: 'number', id: true, required: true})
      .addRelation(<HasManyDefinition>{
        name: 'products',
        type: RelationType.hasMany,
        targetsMany: true,

        source: Category,
        keyFrom: 'id',

        target: () => Product,
        keyTo: 'categoryId',
      });

    const category = new Category({
      id: 1,
      products: [new Product({id: 2, categoryId: 1})],
    });

    const data = category.toJSON();
    expect(data).to.deepEqual({
      id: 1,
      products: [{id: 2, categoryId: 1}],
    });
  });

  it('includes navigational properties in JSON (non-strict-mode)', () => {
    class Category extends Entity {
      id: number;
      products: Product[];

      // allow additional (free-form) properties
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [propName: string]: any;

      constructor(data: Partial<Category>) {
        super(data);
      }
    }

    class Product extends Entity {
      id: number;
      categoryId: number;

      constructor(data: Partial<Product>) {
        super(data);
      }
    }

    Category.definition = new ModelDefinition('Category')
      .addSetting('strict', false)
      .addProperty('id', {type: 'number', id: true, required: true})
      .addRelation(<HasManyDefinition>{
        name: 'products',
        type: RelationType.hasMany,
        targetsMany: true,

        source: Category,
        keyFrom: 'id',

        target: () => Product,
        keyTo: 'categoryId',
      });

    const category = new Category({
      id: 1,
      products: [new Product({id: 2, categoryId: 1})],
    });

    const data = category.toJSON();
    expect(data).to.deepEqual({
      id: 1,
      products: [{id: 2, categoryId: 1}],
    });
  });

  it('supports non-strict model in toJSON()', () => {
    const DATA = {id: 'uid', extra: 'additional data'};
    const instance = new Flexible(DATA);
    const actual = instance.toJSON();
    expect(actual).to.deepEqual(DATA);
  });

  it('converts to plain object', () => {
    const customer = createCustomer();
    Object.assign(customer, {unknown: 'abc'});
    expect(customer.toObject()).to.eql({id: '123', email: 'xyz@example.com'});
    expect(customer.toObject({ignoreUnknownProperties: false})).to.eql({
      id: '123',
      email: 'xyz@example.com',
      unknown: 'abc',
    });
  });

  it('converts to plain object recursively', () => {
    const aDate = new Date();
    const customer = createCustomerWithContactAndDate(aDate);
    Object.assign(customer, {unknown: 'abc'});
    Object.assign(customer.address, {unknown: 'xyz'});
    expect(customer.toObject()).to.eql({
      id: '123',
      email: 'xyz@example.com',
      createdAt: aDate,
      address: {
        street: '123 A St',
        city: 'San Jose',
        state: 'CA',
        zipCode: '95131',
      },
      phones: [
        {label: 'home', number: '111-222-3333'},
        {label: 'work', number: '111-222-5555'},
      ],
    });
    expect(customer.toObject({ignoreUnknownProperties: false})).to.eql({
      id: '123',
      email: 'xyz@example.com',
      createdAt: aDate,
      unknown: 'abc',
      address: {
        street: '123 A St',
        city: 'San Jose',
        state: 'CA',
        zipCode: '95131',
        unknown: 'xyz',
      },
      phones: [
        {label: 'home', number: '111-222-3333'},
        {label: 'work', number: '111-222-5555'},
      ],
    });
  });

  it('converts to plain object including relation properties', () => {
    class Category extends Entity {
      id: number;
      products: Product[];

      // allow additional (free-form) properties
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [propName: string]: any;

      constructor(data: Partial<Category>) {
        super(data);
      }
    }

    class Product extends Entity {
      id: number;
      categoryId: number;

      constructor(data: Partial<Product>) {
        super(data);
      }
    }

    Category.definition = new ModelDefinition('Category')
      .addSetting('strict', false)
      .addProperty('id', {type: 'number', id: true, required: true})
      .addRelation(<HasManyDefinition>{
        name: 'products',
        type: RelationType.hasMany,
        targetsMany: true,

        source: Category,
        keyFrom: 'id',

        target: () => Product,
        keyTo: 'categoryId',
      });

    const category = new Category({
      id: 1,
      products: [new Product({id: 2, categoryId: 1})],
    });

    const data = category.toObject();
    expect(data).to.deepEqual({
      id: 1,
      products: [{id: 2, categoryId: 1}],
    });
  });

  it('gets id', () => {
    const customer = createCustomer();
    expect(customer.getId()).to.eql('123');
  });

  it('gets id object', () => {
    const customer = createCustomer();
    expect(customer.getIdObject()).to.eql({id: '123'});
  });

  it('builds where for id', () => {
    const where = Customer.buildWhereForId('123');
    expect(where).to.eql({id: '123'});
  });

  it('gets composite id', () => {
    const customer = createRealmCustomer();
    expect(customer.getId()).to.eql({realm: 'org1', email: 'xyz@example.com'});
  });

  it('gets composite id object', () => {
    const customer = createRealmCustomer();
    expect(customer.getIdObject()).to.eql({
      realm: 'org1',
      email: 'xyz@example.com',
    });
  });

  it('builds where for composite id', () => {
    const where = RealmCustomer.buildWhereForId({
      realm: 'org1',
      email: 'xyz@example.com',
    });
    expect(where).to.eql({realm: 'org1', email: 'xyz@example.com'});
  });

  it('reports helpful error when getting ids of a model with no ids', () => {
    class NoId extends Entity {
      static definition = new ModelDefinition('NoId');
    }

    const instance = new NoId();
    expect(() => instance.getId()).to.throw(/missing.*id/);
  });

  it('gets id names via a static method', () => {
    const names = Customer.getIdProperties();
    expect(names).to.deepEqual(['id']);
  });

  it('reads model name from the definition', () => {
    expect(Customer.modelName).to.equal('Customer');
  });

  it('reads model name from the class name', () => {
    class MyModel extends Entity {}
    expect(MyModel.modelName).to.equal('MyModel');
  });

  it('excludes hidden properties from toJSON() output', () => {
    const user = createUser();
    expect(user.toJSON()).to.eql({
      id: '123',
      email: 'xyz@example.com',
      firstName: 'Test User',
    });
  });

  it('excludes hidden properties from toJSON() output with strict false', () => {
    const flexible = new Flexible({
      id: '123a',
      createdAt: new Date(),
    });
    expect(flexible.toJSON()).to.eql({
      id: '123a',
    });
  });

  it('gets id of an object through a static method', () => {
    const userId = User.getIdOf({
      id: '53',
      email: 'loopback@localhost',
      password: 'l00pback',
      firstName: 'Loopback User',
    });
    expect(userId).to.eql('53');
  });

  describe('rejectNavigationalPropertiesInData', () => {
    class Order extends Entity {
      static definition = new ModelDefinition('Order')
        .addProperty('id', {type: 'string', id: true})
        .addRelation(<BelongsToDefinition>{
          name: 'customer',
          type: RelationType.belongsTo,
          targetsMany: false,
          source: Order,
          target: () => User,
          keyFrom: 'customerId',
        });

      id: string;
      customerId: string;

      customer?: User;
    }

    it('accepts data with no navigational properties', () => {
      rejectNavigationalPropertiesInData(Order, {id: '1'});
    });

    it('rejects data with a navigational property', () => {
      expect(() =>
        rejectNavigationalPropertiesInData(Order, {
          id: '1',
          customer: {
            id: '2',
            email: 'test@example.com',
            firstName: 'a customer',
          },
        }),
      ).to.throw(/Navigational properties are not allowed in model data/);
    });
  });

  describe('relation helpers', () => {
    it('adds belongsTo relation', () => {
      const definition = new ModelDefinition('Phone').belongsTo('customer', {
        source: Phone,
        keyFrom: 'customerId',

        target: () => Customer,
        keyTo: 'id',
      });

      expect(definition.relations.customer).to.eql({
        name: 'customer',
        source: Phone,
        keyFrom: 'customerId',
        target: () => Customer,
        keyTo: 'id',
        type: RelationType.belongsTo,
        targetsMany: false,
      });
    });

    it('adds hasOne relation', () => {
      const definition = new ModelDefinition('Customer').hasOne('address', {
        source: Customer,
        keyFrom: 'id',

        target: () => Address,
        keyTo: 'customerId',
      });

      expect(definition.relations.address).to.eql({
        name: 'address',
        source: Customer,
        keyFrom: 'id',
        target: () => Address,
        keyTo: 'customerId',
        type: RelationType.hasOne,
        targetsMany: false,
      });
    });

    it('adds hasMany relation', () => {
      const definition = new ModelDefinition('Customer').hasMany('phones', {
        source: Customer,
        keyFrom: 'id',

        target: () => Phone,
        keyTo: 'customerId',
      });

      expect(definition.relations.phones).to.eql({
        name: 'phones',
        source: Customer,
        keyFrom: 'id',
        target: () => Phone,
        keyTo: 'customerId',
        type: RelationType.hasMany,
        targetsMany: true,
      });
    });
  });
});
