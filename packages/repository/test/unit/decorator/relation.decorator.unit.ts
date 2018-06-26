// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Entity, hasMany, RELATIONS_KEY, RelationType, property} from '../../..';
import {MetadataInspector} from '@loopback/context';
import {MODEL_PROPERTIES_KEY} from '../../../src';

describe('relation decorator', () => {
  context('hasMany', () => {
    it('takes in complex property type', () => {
      class Address extends Entity {
        addressId: number;
        street: string;
        province: string;
      }

      class AddressBook extends Entity {
        id: number;

        @hasMany(Address) addresses: Address[];
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
      });
      expect(jugglerMeta).to.eql({
        type: Address,
        array: true,
      });
    });

    it('takes in hasMany metadata', () => {
      class Address extends Entity {
        addressId: number;
        street: string;
        province: string;
      }

      class AddressBook extends Entity {
        id: number;

        @hasMany({keyFrom: 'somePrimaryKey', keyTo: 'someForeignKey'})
        addresses: Address[];
      }

      const meta = MetadataInspector.getPropertyMetadata(
        RELATIONS_KEY,
        AddressBook.prototype,
        'addresses',
      );
      expect(meta).to.eql({
        type: RelationType.hasMany,
        keyFrom: 'somePrimaryKey',
        keyTo: 'someForeignKey',
      });
    });

    it('takes in both hasMany metadata and complex property type', () => {
      class Address extends Entity {
        addressId: number;
        street: string;
        province: string;
      }

      class AddressBook extends Entity {
        id: number;

        @hasMany({keyFrom: 'somePrimaryKey', keyTo: 'someForeignKey'}, Address)
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
        keyFrom: 'somePrimaryKey',
        keyTo: 'someForeignKey',
      });
      expect(jugglerMeta).to.eql({
        type: Address,
        array: true,
      });
    });

    context('when interacting with @property.array', () => {
      // Do you think this test case is necessary?
      it('does not get its property metadata overwritten by @property.array', () => {
        expect(() => {
          class Address extends Entity {
            addressId: number;
            street: string;
            province: string;
          }

          class AddressBook extends Entity {
            id: number;
            @property.array(Entity)
            @hasMany(
              {keyFrom: 'somePrimaryKey', keyTo: 'someForeignKey'},
              Address,
            )
            addresses: Address[];
          }
        }).to.throw(/Decorator cannot be applied more than once/);
      });
    });
  });
});
