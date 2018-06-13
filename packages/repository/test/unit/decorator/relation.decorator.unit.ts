// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Entity, hasMany, RELATIONS_KEY, RelationType, property} from '../../..';
import {MetadataInspector} from '@loopback/context';
import {MODEL_PROPERTIES_KEY, model} from '../../../src';

describe('relation decorator', () => {
  context('hasMany', () => {
    it('throws when foreign key is not defined in the target TypeScript model', () => {
      expect(() => {
        @model()
        class Address extends Entity {
          addressId: number;
          street: string;
          province: string;
        }

        // tslint:disable-next-line:no-unused-variable
        class AddressBook extends Entity {
          id: number;

          @hasMany(Address) addresses: Address[];
        }
      }).throw(/addressBookId not found on Address/);
    });

    it('takes in complex property type and infers foreign key via source model name', () => {
      @model()
      class Address extends Entity {
        addressId: number;
        street: string;
        province: string;
        @property() addressBookId: number;
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
        keyTo: 'addressBookId',
      });
      expect(jugglerMeta).to.eql({
        type: Address,
        array: true,
      });
    });

    it('takes in both complex property type and asMany metadata', () => {
      class Address extends Entity {
        addressId: number;
        street: string;
        province: string;
      }

      class AddressBook extends Entity {
        id: number;

        @hasMany(Address, {keyTo: 'someForeignKey'})
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

          // tslint:disable-next-line:no-unused-variable
          class AddressBook extends Entity {
            id: number;
            @property.array(Entity)
            @hasMany(Address, {
              keyTo: 'someForeignKey',
            })
            addresses: Address[];
          }
        }).to.throw(/Decorator cannot be applied more than once/);
      });
    });
  });
});
