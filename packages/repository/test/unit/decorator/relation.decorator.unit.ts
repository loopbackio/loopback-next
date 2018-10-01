// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Entity, hasMany, RELATIONS_KEY, RelationType, property} from '../../..';
import {MetadataInspector} from '@loopback/context';
import {MODEL_PROPERTIES_KEY, model, getModelRelations} from '../../../src';

describe('relation decorator', () => {
  context('hasMany', () => {
    it('takes in complex property type and infers foreign key via source model name', () => {
      @model()
      class Address extends Entity {
        addressId: number;
        street: string;
        province: string;
        @property()
        addressBookId: number;
      }

      class AddressBook extends Entity {
        id: number;

        @hasMany(() => Address)
        addresses: Address[];
      }

      const meta = MetadataInspector.getPropertyMetadata(
        RELATIONS_KEY,
        AddressBook.prototype,
        'addresses',
      );
      const jugglerMeta = MetadataInspector.getPropertyMetadata(
        MODEL_PROPERTIES_KEY,
        AddressBook.prototype,
        'addresses',
      );
      expect(meta).to.eql({
        type: RelationType.hasMany,
        name: 'addresses',
        source: AddressBook,
        target: () => Address,
      });

      expect(jugglerMeta).to.eql({
        type: Array,
        itemType: () => Address,
      });
    });

    it('takes in both complex property type and hasMany metadata', () => {
      class Address extends Entity {
        addressId: number;
        street: string;
        province: string;
      }

      class AddressBook extends Entity {
        id: number;

        @hasMany(() => Address, {keyTo: 'someForeignKey'})
        addresses: Address[];
      }

      const meta = MetadataInspector.getPropertyMetadata(
        RELATIONS_KEY,
        AddressBook.prototype,
        'addresses',
      );
      const jugglerMeta = MetadataInspector.getPropertyMetadata(
        MODEL_PROPERTIES_KEY,
        AddressBook.prototype,
        'addresses',
      );
      expect(meta).to.eql({
        type: RelationType.hasMany,
        name: 'addresses',
        source: AddressBook,
        target: () => Address,
        keyTo: 'someForeignKey',
      });
      expect(jugglerMeta).to.eql({
        type: Array,
        itemType: () => Address,
      });
    });

    context('when interacting with @property.array', () => {
      it('does not get its property metadata overwritten by @property.array', () => {
        expect(() => {
          class Address extends Entity {
            addressId: number;
            street: string;
            province: string;
          }

          // tslint:disable-next-line:no-unused-variable
          class AddressBook extends Entity {
            id: number;
            @property.array(Entity)
            @hasMany(() => Address, {
              keyTo: 'someForeignKey',
            })
            addresses: Address[];
          }
        }).to.throw(/Decorator cannot be applied more than once/);
      });
    });
  });
});

describe('getModelRelations', () => {
  it('returns relation metadata for own and inherited properties', () => {
    @model()
    class AccessToken extends Entity {
      @property({id: true})
      userId: number;
    }

    @model()
    class User extends Entity {
      @hasMany(() => AccessToken)
      accessTokens: AccessToken[];
    }

    @model()
    class Order extends Entity {
      @property({id: true})
      customerId: number;
    }

    @model()
    class Customer extends User {
      @hasMany(() => Order)
      orders: Order[];
    }

    const relations = getModelRelations(Customer);
    expect(relations).to.containDeep({
      accessTokens: {
        name: 'accessTokens',
        type: 'hasMany',
        target: () => AccessToken,
      },
      orders: {
        name: 'orders',
        type: 'hasMany',
        target: () => Order,
      },
    });
  });
});
