// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Entity, hasMany, RELATIONS_KEY, RelationType, property} from '../../..';
import {MetadataInspector} from '@loopback/context';

describe('relation decorator', () => {
  context('hasMany', () => {
    it('infers property type from property decorator', () => {
      class Address extends Entity {
        addressId: number;
        street: string;
        province: string;
      }

      class AddressBook extends Entity {
        id: number;

        @hasMany()
        @property.array(Address)
        addresses: Address[];
      }

      const meta = MetadataInspector.getPropertyMetadata(
        RELATIONS_KEY,
        AddressBook.prototype,
        'addresses',
      );
      expect(meta).to.eql({
        type: RelationType.hasMany,
        modelFrom: AddressBook,
      });
    });
  });
});
