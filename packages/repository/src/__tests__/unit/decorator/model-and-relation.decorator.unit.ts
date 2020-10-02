// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {MetadataInspector} from '@loopback/core';
import {expect} from '@loopback/testlab';
import {RelationMetadata} from '../../..';
import {
  belongsTo,
  embedsMany,
  embedsOne,
  Entity,
  hasMany,
  hasOne,
  model,
  MODEL_KEY,
  MODEL_PROPERTIES_KEY,
  property,
  referencesMany,
  referencesOne,
  relation,
  RELATIONS_KEY,
  RelationType,
  ValueObject,
} from '../../../';

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

  @model()
  class Product extends Entity {
    @property()
    id: string;

    @property()
    name: string;

    @property()
    price: number;
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

    @belongsTo(() => Customer)
    customerId: string;

    // Validates that property no longer requires a parameter
    @property()
    isShipped: boolean;
  }

  @model()
  class Customer extends Entity {
    @property({type: 'string', id: true, generated: true})
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

    @hasMany(() => Order)
    orders?: Order[];

    @hasOne(() => Order)
    lastOrder?: Order;

    @relation({type: RelationType.hasMany})
    recentOrders?: Order[];
  }

  it('hides a property defined as hidden', () => {
    @model()
    class Client extends Entity {
      @property()
      name: string;
      @property({hidden: true})
      password: string;

      constructor(data: Partial<Client>) {
        super(data);
      }
    }
    const client = new Client({
      name: 'name',
      password: 'password',
    });
    expect(Client.definition.settings.hiddenProperties).to.containEql(
      'password',
    );
    expect(client.toJSON()).to.eql({
      name: 'name',
    });
  });

  it('throws error if design type is not provided', () => {
    const createModel = () => {
      @model()
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class Client extends Entity {
        @property()
        id: undefined;
      }
    };

    expect(createModel).to.throw(Error, {code: 'CANNOT_INFER_PROPERTY_TYPE'});
  });

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

  it('updates static property "modelName"', () => {
    @model()
    class Category extends Entity {}
    expect(Category.modelName).to.equal('Category');
  });

  it('adds model metadata with arbitrary properties', () => {
    @model({arbitrary: 'property'})
    class Arbitrary {
      name: string;
    }

    const meta: {[props: string]: string} =
      MetadataInspector.getClassMetadata(MODEL_KEY, Arbitrary) ??
      /* istanbul ignore next */ {};
    expect(meta.arbitrary).to.eql('property');
  });

  it('adds property metadata', () => {
    const meta =
      MetadataInspector.getAllPropertyMetadata(
        MODEL_PROPERTIES_KEY,
        Order.prototype,
      ) ?? /* istanbul ignore next */ {};
    expect(meta.quantity).to.eql({
      type: Number,
      mysql: {
        column: 'QTY',
      },
    });
    expect(meta.id).to.eql({
      type: 'string',
      id: true,
      generated: true,
      useDefaultIdType: false,
    });
    expect(meta.isShipped).to.eql({type: Boolean});
  });

  it('adds explicitly declared array property metadata', () => {
    @model()
    class ArrayModel {
      @property({type: Array})
      strArr: string[];
    }

    const meta =
      MetadataInspector.getAllPropertyMetadata(
        MODEL_PROPERTIES_KEY,
        ArrayModel.prototype,
      ) ?? /* istanbul ignore next */ {};
    expect(meta.strArr).to.eql({type: Array});
  });

  it('adds embedsOne metadata', () => {
    const meta =
      MetadataInspector.getAllPropertyMetadata(
        RELATIONS_KEY,
        Customer.prototype,
      ) ?? /* istanbul ignore next */ {};
    expect(meta.address).to.eql({
      type: RelationType.embedsOne,
    });
  });

  it('adds embedsMany metadata', () => {
    const meta =
      MetadataInspector.getAllPropertyMetadata(
        RELATIONS_KEY,
        Customer.prototype,
      ) ?? /* istanbul ignore next */ {};
    expect(meta.phones).to.eql({
      type: RelationType.embedsMany,
    });
  });

  it('adds referencesMany metadata', () => {
    const meta =
      MetadataInspector.getAllPropertyMetadata(
        RELATIONS_KEY,
        Customer.prototype,
      ) ?? /* istanbul ignore next */ {};
    expect(meta.accounts).to.eql({
      type: RelationType.referencesMany,
    });
  });

  it('adds referencesOne metadata', () => {
    const meta =
      MetadataInspector.getAllPropertyMetadata(
        RELATIONS_KEY,
        Customer.prototype,
      ) ?? /* istanbul ignore next */ {};
    expect(meta.profile).to.eql({
      type: RelationType.referencesOne,
    });
  });

  it('adds hasMany metadata', () => {
    const meta =
      MetadataInspector.getAllPropertyMetadata<RelationMetadata>(
        RELATIONS_KEY,
        Customer.prototype,
      ) ?? /* istanbul ignore next */ {};
    expect(meta.orders).to.containEql({
      type: RelationType.hasMany,
      name: 'orders',
    });
    expect(meta.orders.source).to.be.exactly(Customer);
    expect(meta.orders.target()).to.be.exactly(Order);
  });

  it('adds belongsTo metadata', () => {
    const meta =
      MetadataInspector.getAllPropertyMetadata<RelationMetadata>(
        RELATIONS_KEY,
        Order.prototype,
      ) ?? /* istanbul ignore next */ {};
    const relationDef = meta.customerId;
    expect(relationDef).to.containEql({
      type: RelationType.belongsTo,
      name: 'customer',
      target: () => Customer,
      keyFrom: 'customerId',
    });
    expect(relationDef.source).to.be.exactly(Order);
    expect(relationDef.target()).to.be.exactly(Customer);
  });

  it('adds hasOne metadata', () => {
    const meta =
      MetadataInspector.getAllPropertyMetadata(
        RELATIONS_KEY,
        Customer.prototype,
      ) ?? /* istanbul ignore next */ {};
    expect(meta.lastOrder).to.containEql({
      type: RelationType.hasOne,
      name: 'lastOrder',
      target: () => Order,
      source: Customer,
    });
  });

  it('adds relation metadata', () => {
    const meta =
      MetadataInspector.getAllPropertyMetadata(
        RELATIONS_KEY,
        Customer.prototype,
      ) ?? /* istanbul ignore next */ {};
    expect(meta.recentOrders).to.eql({
      type: RelationType.hasMany,
    });
  });

  it('adds hasMany metadata to the constructor', () => {
    class Person extends Entity {}

    @model()
    class House extends Entity {
      @property()
      name: string;
      @hasMany(() => Person, {keyTo: 'fk'})
      person: Person[];
    }

    const relationMeta = MetadataInspector.getPropertyMetadata(
      RELATIONS_KEY,
      House.prototype,
      'person',
    );
    expect(House.definition).to.have.property('relations');
    expect(House.definition.relations).to.containEql({person: relationMeta});
  });

  describe('property namespace', () => {
    describe('array', () => {
      it('"@property.array" adds array metadata', () => {
        @model()
        class TestModel {
          @property.array(Product)
          items: Product[];
        }

        const meta =
          MetadataInspector.getAllPropertyMetadata(
            MODEL_PROPERTIES_KEY,
            TestModel.prototype,
          ) ?? /* istanbul ignore next */ {};
        expect(meta.items).to.eql({type: Array, itemType: Product});
      });

      it('throws when @property.array is used on a non-array property', () => {
        expect.throws(
          () => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            class Oops {
              @property.array(Product)
              product: Product;
            }
          },
          Error,
          property.ERR_PROP_NOT_ARRAY,
        );
      });
    });
  });
});
