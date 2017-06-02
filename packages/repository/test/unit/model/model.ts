// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import { expect } from '@loopback/testlab';
import { STRING } from '../../../src/types';
import { Model, Entity, ModelDefinition, PropertyDefinition } from '../../../src/model';

describe('model', () => {

  const customerDef = new ModelDefinition('Customer');
  customerDef.addProperty(new PropertyDefinition('id', 'string'))
    .addProperty('email', 'string').addProperty('firstName', String)
    .addProperty('lastName', STRING)
    .addSetting('id', 'id');

  const relamCustomerDef = new ModelDefinition('RealmCustomer');
  relamCustomerDef.addProperty(new PropertyDefinition('realm', 'string'))
    .addProperty('email', 'string').addProperty('firstName', String)
    .addProperty('lastName', STRING)
    .addSetting('id', ['realm', 'email']);

  const userDef = new ModelDefinition('User');
  const idProp = new PropertyDefinition('id', 'string');
  idProp.id = true;
  userDef.addProperty(idProp)
    .addProperty('email', 'string').addProperty('firstName', String)
    .addProperty('lastName', STRING);

  class Customer extends Entity {
    static modelName = 'Customer';
    static definition = customerDef;
  }

  class RealmCustomer extends Entity {
    static modelName = 'RealmCustomer';
    static definition = relamCustomerDef;
  }

  class User extends Entity {
    static modelName = 'User';
    static definition = userDef;
  }

  function createCustomer() {
    const customer = new Customer();
    customer.id = '123';
    customer.email = 'xyz@example.com';
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
    expect(customerDef.properties).have.properties('id', 'email', 'lastName', 'firstName');
    expect(customerDef.properties.lastName).to.eql(
      new PropertyDefinition('lastName', STRING));
  });

  it('adds settings', () => {
    expect(customerDef.settings).have.property('id', 'id');
  });

  it('lists id properties', () => {
    expect(customerDef.idProperties()).to.eql([customerDef.properties.id]);
    expect(userDef.idProperties()).to.eql([userDef.properties.id]);
    expect(relamCustomerDef.idProperties()).to.eql([
        relamCustomerDef.properties.realm,
        relamCustomerDef.properties.email,
      ]);
  });

  it('converts to json', () => {
    const customer = createCustomer();
    expect(customer.toJSON()).to.eql({ id: '123', email: 'xyz@example.com' });
  });

  it('converts to plain object', () => {
    const customer = createCustomer();
    customer.unknown = 'abc';
    expect(customer.toObject()).to.eql({ id: '123', email: 'xyz@example.com' });
    expect(customer.toObject({ignoreUnknownProperties: false}))
      .to.eql({ id: '123', email: 'xyz@example.com', unknown: 'abc' });
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
    expect(customer.getId()).to.eql(
      {realm: 'org1', email: 'xyz@example.com'});
  });

  it('gets composite id object', () => {
    const customer = createRealmCustomer();
    expect(customer.getIdObject()).to.eql(
      {realm: 'org1', email: 'xyz@example.com'});
  });

  it('builds where for composite id', () => {
    const where = RealmCustomer.buildWhereForId(
      {realm: 'org1', email: 'xyz@example.com'});
    expect(where).to.eql({realm: 'org1', email: 'xyz@example.com'});
  });

});
