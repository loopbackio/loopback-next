// Copyright IBM Corp. 2017,2018. All Rights Reserved.
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
import {MetadataInspector} from '@loopback/context';

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

  @model({
    properties: {
      id: {
        type: 'number',
        required: true,
      },
    },
  })
  class Receipt extends Entity {
    id: number;
    customerId: number;
    orderId: number;
    subtotal: number;
    tax: number;
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

  @model()
  class Product extends Entity {
    @property() id: string;

    @property() name: string;

    @property() price: number;
  }

  @model({name: 'order'})
  class Order extends Entity {
    @property({
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

    // Validates that property no longer requires a parameter
    @property() isShipped: boolean;
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
    const meta = MetadataInspector.getClassMetadata(MODEL_KEY, Order);
    expect(meta).to.eql({name: 'order'});
  });

  it('adds model metadata without name', () => {
    const meta = MetadataInspector.getClassMetadata(MODEL_KEY, Receipt);
    expect(meta).to.eql({
      name: 'Receipt',
      properties: {
        id: {
          type: 'number',
          required: true,
        },
      },
    });
  });

  it('adds model metadata with custom name', () => {
    @model({name: 'foo'})
    class Doohickey {
      name: string;
    }

    const meta = MetadataInspector.getClassMetadata(MODEL_KEY, Doohickey);
    expect(meta).to.eql({name: 'foo'});
  });

  it('adds model metadata with arbitrary properties', () => {
    @model({arbitrary: 'property'})
    class Arbitrary {
      name: string;
    }

    const meta: {[props: string]: string} =
      MetadataInspector.getClassMetadata(MODEL_KEY, Arbitrary) ||
      /* istanbul ignore next */ {};
    expect(meta.arbitrary).to.eql('property');
  });

  it('adds property metadata', () => {
    const meta =
      MetadataInspector.getAllPropertyMetadata(
        MODEL_PROPERTIES_KEY,
        Order.prototype,
      ) || /* istanbul ignore next */ {};
    expect(meta.quantity).to.eql({
      type: Number,
      mysql: {
        column: 'QTY',
      },
    });
    expect(meta.id).to.eql({type: 'string', id: true, generated: true});
    expect(meta.isShipped).to.eql({type: Boolean});
  });

  it('adds embedsOne metadata', () => {
    const meta =
      MetadataInspector.getAllPropertyMetadata(
        RELATIONS_KEY,
        Customer.prototype,
      ) || /* istanbul ignore next */ {};
    expect(meta.address).to.eql({
      type: RelationType.embedsOne,
    });
  });

  it('adds embedsMany metadata', () => {
    const meta =
      MetadataInspector.getAllPropertyMetadata(
        RELATIONS_KEY,
        Customer.prototype,
      ) || /* istanbul ignore next */ {};
    expect(meta.phones).to.eql({
      type: RelationType.embedsMany,
    });
  });

  it('adds referencesMany metadata', () => {
    const meta =
      MetadataInspector.getAllPropertyMetadata(
        RELATIONS_KEY,
        Customer.prototype,
      ) || /* istanbul ignore next */ {};
    expect(meta.accounts).to.eql({
      type: RelationType.referencesMany,
    });
  });

  it('adds referencesOne metadata', () => {
    const meta =
      MetadataInspector.getAllPropertyMetadata(
        RELATIONS_KEY,
        Customer.prototype,
      ) || /* istanbul ignore next */ {};
    expect(meta.profile).to.eql({
      type: RelationType.referencesOne,
    });
  });

  it('adds hasMany metadata', () => {
    const meta =
      MetadataInspector.getAllPropertyMetadata(
        RELATIONS_KEY,
        Customer.prototype,
      ) || /* istanbul ignore next */ {};
    expect(meta.orders).to.eql({
      type: RelationType.hasMany,
    });
  });

  it('adds belongsTo metadata', () => {
    const meta =
      MetadataInspector.getAllPropertyMetadata(
        RELATIONS_KEY,
        Order.prototype,
      ) || /* istanbul ignore next */ {};
    expect(meta.customer).to.eql({
      type: RelationType.belongsTo,
      target: 'Customer',
    });
  });

  it('adds hasOne metadata', () => {
    const meta =
      MetadataInspector.getAllPropertyMetadata(
        RELATIONS_KEY,
        Customer.prototype,
      ) || /* istanbul ignore next */ {};
    expect(meta.lastOrder).to.eql({
      type: RelationType.hasOne,
    });
  });

  it('adds relation metadata', () => {
    const meta =
      MetadataInspector.getAllPropertyMetadata(
        RELATIONS_KEY,
        Customer.prototype,
      ) || /* istanbul ignore next */ {};
    expect(meta.recentOrders).to.eql({
      type: RelationType.hasMany,
    });
  });

  describe('property namespace', () => {
    describe('array', () => {
      it('"@property.array" adds array metadata', () => {
        @model()
        class TestModel {
          @property.array(Product) items: Product[];
        }

        const meta =
          MetadataInspector.getAllPropertyMetadata(
            MODEL_PROPERTIES_KEY,
            TestModel.prototype,
          ) || /* istanbul ignore next */ {};
        expect(meta.items).to.eql({type: Product, array: true});
      });

      it('throws when @property.array is used on a non-array property', () => {
        expect.throws(
          () => {
            // tslint:disable-next-line:no-unused-variable
            class Oops {
              @property.array(Product) product: Product;
            }
          },
          Error,
          property.ERR_PROP_NOT_ARRAY,
        );
      });
    });
  });
});
