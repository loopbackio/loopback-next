// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import { expect } from '@loopback/testlab';
import { model, property, MODEL_KEY, PROPERTY_KEY }
  from '../../../src/decorators/model';
import { belongsTo, embedsOne, embedsMany, hasMany, referencesMany,
  referencesOne, RELATION_KEY, RelationType } from '../../../src/decorators/relation';

import { Entity, ValueObject } from '../../../src/model';
import { Reflector } from '@loopback/context';

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

  @model()
  class Customer extends Entity {
    id: string;
    email: string;
    firstName: string;
    lastName: string;

    @embedsOne()
    address: Address;

    @embedsMany()
    phones: Phone[];

    @referencesMany()
    accounts: Account[];

    @referencesOne()
    profile: Profile;

    @hasMany()
    orders?: Order[];
  }

  @model({ name: 'order' })
  class Order extends Entity {
    @property({
      name: 'qty', mysql: {
        column: 'QTY',
      },
    })
    quantity: number;

    @property({ name: 'id', id: true, generated: true })
    id: string;
    customerId: string;

    @belongsTo({ target: 'Customer' })
    customer: Customer;
  }

  // Skip the tests before we resolve the issue around global `Reflector`
  // The tests are passing it run alone but fails with `npm test`
  it('adds model metadata', () => {
    const meta = Reflector.getOwnMetadata(MODEL_KEY, Order);
    expect(meta).to.eql({ name: 'order' });
  });

  it('adds property metadata', () => {
    const meta = Reflector.getOwnMetadata(PROPERTY_KEY, Order.prototype, 'quantity');
    expect(meta).to.eql({
      name: 'qty', mysql: {
        column: 'QTY',
      },
    });
  });

  it('adds embedsOne metadata', () => {
    const meta = Reflector.getOwnMetadata(RELATION_KEY, Customer.prototype, 'address');
    expect(meta).to.eql({
      type: RelationType.embedsOne,
    });
  });

  it('adds embedsMany metadata', () => {
    const meta = Reflector.getOwnMetadata(RELATION_KEY, Customer.prototype, 'phones');
    expect(meta).to.eql({
      type: RelationType.embedsMany,
    });
  });

  it('adds referencesMany metadata', () => {
    const meta = Reflector.getOwnMetadata(RELATION_KEY, Customer.prototype, 'accounts');
    expect(meta).to.eql({
      type: RelationType.referencesMany,
    });
  });

  it('adds referencesOne metadata', () => {
    const meta = Reflector.getOwnMetadata(RELATION_KEY, Customer.prototype, 'profile');
    expect(meta).to.eql({
      type: RelationType.referencesOne,
    });
  });

  it('adds hasMany metadata', () => {
    const meta = Reflector.getOwnMetadata(RELATION_KEY, Customer.prototype, 'orders');
    expect(meta).to.eql({
      type: RelationType.hasMany,
    });
  });

  it('adds belongsTo metadata', () => {
    const meta = Reflector.getOwnMetadata(RELATION_KEY, Order.prototype, 'customer');
    expect(meta).to.eql({
      type: RelationType.belongsTo,
      target: 'Customer',
    });
  });

});
