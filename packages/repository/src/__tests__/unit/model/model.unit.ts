// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {STRING} from '../../../';
import {Entity, ModelDefinition} from '../../../';

describe('model', () => {
  const customerDef = new ModelDefinition('Customer');
  customerDef
    .addProperty('id', 'string')
    .addProperty('email', 'string')
    .addProperty('firstName', String)
    .addProperty('lastName', STRING)
    .addProperty('address', 'object')
    .addProperty('phones', 'array')
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
    .addProperty('firstName', String)
    .addProperty('lastName', STRING);

  const flexibleDef = new ModelDefinition('Flexible');
  flexibleDef
    .addProperty('id', {type: 'string', id: true})
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
    email: string;
    firstName: string;
    lastName: string;
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

  // tslint:disable-next-line:no-unused
  class User extends Entity {
    static definition = userDef;
    id: string;
    email: string;
    firstName: string;

    constructor(data?: Partial<User>) {
      super(data);
    }
  }

  class Flexible extends Entity {
    static definition = flexibleDef;

    id: string;

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

  function createRealmCustomer() {
    const customer = new RealmCustomer();
    customer.realm = 'org1';
    customer.email = 'xyz@example.com';
    return customer;
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
    const customer = createCustomerWithContact();
    Object.assign(customer, {unknown: 'abc'});
    Object.assign(customer.address, {unknown: 'xyz'});
    expect(customer.toObject()).to.eql({
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
    expect(customer.toObject({ignoreUnknownProperties: false})).to.eql({
      id: '123',
      email: 'xyz@example.com',
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

  it('reads model name from the definition', () => {
    expect(Customer.modelName).to.equal('Customer');
  });

  it('reads model name from the class name', () => {
    class MyModel extends Entity {}
    expect(MyModel.modelName).to.equal('MyModel');
  });
});
