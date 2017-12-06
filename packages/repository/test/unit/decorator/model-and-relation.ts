// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {model, property, MODEL_KEY, MODEL_PROPERTIES_KEY} from '../../../';
import {
  relation,
  hasOne,
  belongsTo,
  embedsOne,
  embedsMany,
  hasMany,
  referencesMany,
  referencesOne,
  RELATIONS_KEY,
  RelationType,
} from '../../../';

import {Entity, ValueObject} from '../../../';
import {Reflector} from '@loopback/context';

describe('model decorator', () => {
  @model()
  class Address extends ValueObject {
    street: string;
    city: string;
    zipCode: string;
    state: string;
  }

  @model()
  class Phone extends ValueObject {
    type: string;
    number: string;
  }

  @model()
  class Account extends Entity {
    id: string;
    type: string;
    balance: number;
  }

  @model()
  class Profile extends Entity {
    id: string;
    description: string;
  }

  interface ICustomer {}

  @model({name: 'order'})
  class Order extends Entity {
    @property({
      type: 'number',
      mysql: {
        column: 'QTY',
      },
    })
    quantity: number;

    @property({type: 'string', id: true, generated: true})
    id: string;
    customerId: string;

    @belongsTo({target: 'Customer'})
    // TypeScript does not allow me to reference Customer here
    customer: ICustomer;
  }

  @model()
  class Customer extends Entity implements ICustomer {
    id: string;
    email: string;
    firstName: string;
    lastName: string;

    @embedsOne() address: Address;

    @embedsMany() phones: Phone[];

    @referencesMany() accounts: Account[];

    @referencesOne() profile: Profile;

    @hasMany() orders?: Order[];

    @hasOne() lastOrder?: Order;

    @relation({type: RelationType.hasMany})
    recentOrders?: Order[];
  }

  // Skip the tests before we resolve the issue around global `Reflector`
  // The tests are passing it run alone but fails with `npm test`
  it('adds model metadata', () => {
    const meta = Reflector.getOwnMetadata(MODEL_KEY, Order);
    expect(meta).to.eql({name: 'order'});
  });

  it('adds property metadata', () => {
    const meta = Reflector.getOwnMetadata(
      MODEL_PROPERTIES_KEY,
      Order.prototype,
    );
    expect(meta.quantity).to.eql({
      type: 'number',
      mysql: {
        column: 'QTY',
      },
    });
  });

  it('adds embedsOne metadata', () => {
    const meta = Reflector.getOwnMetadata(RELATIONS_KEY, Customer.prototype);
    expect(meta.address).to.eql({
      type: RelationType.embedsOne,
    });
  });

  it('adds embedsMany metadata', () => {
    const meta = Reflector.getOwnMetadata(RELATIONS_KEY, Customer.prototype);
    expect(meta.phones).to.eql({
      type: RelationType.embedsMany,
    });
  });

  it('adds referencesMany metadata', () => {
    const meta = Reflector.getOwnMetadata(RELATIONS_KEY, Customer.prototype);
    expect(meta.accounts).to.eql({
      type: RelationType.referencesMany,
    });
  });

  it('adds referencesOne metadata', () => {
    const meta = Reflector.getOwnMetadata(RELATIONS_KEY, Customer.prototype);
    expect(meta.profile).to.eql({
      type: RelationType.referencesOne,
    });
  });

  it('adds hasMany metadata', () => {
    const meta = Reflector.getOwnMetadata(RELATIONS_KEY, Customer.prototype);
    expect(meta.orders).to.eql({
      type: RelationType.hasMany,
    });
  });

  it('adds belongsTo metadata', () => {
    const meta = Reflector.getOwnMetadata(RELATIONS_KEY, Order.prototype);
    expect(meta.customer).to.eql({
      type: RelationType.belongsTo,
      target: 'Customer',
    });
  });

  it('adds hasOne metadata', () => {
    const meta = Reflector.getOwnMetadata(RELATIONS_KEY, Customer.prototype);
    expect(meta.lastOrder).to.eql({
      type: RelationType.hasOne,
    });
  });

  it('adds relation metadata', () => {
    const meta = Reflector.getOwnMetadata(RELATIONS_KEY, Customer.prototype);
    expect(meta.recentOrders).to.eql({
      type: RelationType.hasMany,
    });
  });
});
