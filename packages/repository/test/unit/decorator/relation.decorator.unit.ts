// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  Entity,
  hasMany,
  RELATIONS_KEY,
  RelationType,
  property,
  MODEL_PROPERTIES_KEY,
  model,
  belongsTo,
} from '../../..';
import {MetadataInspector} from '@loopback/context';

describe('relation decorator', () => {
  context('hasMany', () => {
    it('assigns it to target key', () => {
      class Address extends Entity {
        addressId: number;
        street: string;
        province: string;
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
      expect(meta).to.eql({
        type: RelationType.hasMany,
        target: () => Address,
      });
    });

    it('accepts explicit keyTo property', () => {
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
      expect(meta).to.eql({
        type: RelationType.hasMany,
        target: () => Address,
        keyTo: 'someForeignKey',
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

  context('belongsTo', () => {
    it('creates juggler property metadata', () => {
      @model()
      class AddressBook extends Entity {
        @property({id: true})
        id: number;
      }
      class Address extends Entity {
        @belongsTo(() => AddressBook)
        addressBookId: number;
      }
      const jugglerMeta = MetadataInspector.getAllPropertyMetadata(
        MODEL_PROPERTIES_KEY,
        Address.prototype,
      );
      expect(jugglerMeta).to.eql({
        addressBookId: {type: Number},
      });
    });

    it('infers foreign key', () => {
      @model()
      class AddressBook extends Entity {
        @property({id: true})
        id: number;
      }
      class Address extends Entity {
        @belongsTo(() => AddressBook)
        addressBookId: number;
        @property()
        someOtherKey: string;
      }
      const meta = MetadataInspector.getAllPropertyMetadata(
        RELATIONS_KEY,
        Address.prototype,
      );
      expect(meta)
        .to.have.property('addressBookId')
        .which.containEql({keyFrom: 'addressBookId'});
    });

    it('assigns it to target key', () => {
      class Address extends Entity {
        addressId: number;
        street: string;
        province: string;
        @belongsTo(() => AddressBook)
        addressBookId: number;
      }

      class AddressBook extends Entity {
        id: number;
        addresses: Address[];
      }

      const meta = MetadataInspector.getPropertyMetadata(
        RELATIONS_KEY,
        Address.prototype,
        'addressBookId',
      );
      expect(meta).to.eql({
        type: RelationType.belongsTo,
        target: () => AddressBook,
        keyFrom: 'addressBookId',
      });
    });

    it('accepts explicit keyTo property', () => {
      class Address extends Entity {
        addressId: number;
        street: string;
        province: string;
        @belongsTo(() => AddressBook, {keyTo: 'somePrimaryKey'})
        addressBookId: number;
      }

      class AddressBook extends Entity {
        id: number;
        addresses: Address[];
      }
      const meta = MetadataInspector.getPropertyMetadata(
        RELATIONS_KEY,
        Address.prototype,
        'addressBookId',
      );
      expect(meta).to.eql({
        type: RelationType.belongsTo,
        target: () => AddressBook,
        keyFrom: 'addressBookId',
        keyTo: 'somePrimaryKey',
      });
    });
  });
});
