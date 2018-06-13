import {expect} from '@loopback/testlab';
import {Entity} from '../../../src/model';
import {hasMany, RELATIONS_KEY, RelationType, property} from '../../../src';
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
        modelTo: Address,
        as: 'addresses',
      });
    });

    it('throws error when property type is not present', () => {
      expect(function() {
        class Order extends Entity {
          id: number;
        }
        class Customer extends Entity {
          id: number;

          // won't be present because `hasMany` decorator is executed first
          @property.array(Order)
          @hasMany()
          orders: Order[];
        }
        MetadataInspector.getPropertyMetadata(
          RELATIONS_KEY,
          Customer.prototype,
          'bars',
        );
      }).to.throw(/Could not infer property type/);
    });

    it('throws when property decorator is not used', () => {
      expect(function() {
        class Order extends Entity {
          id: number;
        }
        class Customer extends Entity {
          id: number;
          @hasMany() orders: Order[];
        }
        MetadataInspector.getPropertyMetadata(
          RELATIONS_KEY,
          Customer.prototype,
          'bars',
        );
      }).to.throw(/Could not infer property type/);
    });

    it('should take modelFrom key manually', () => {
      class Order extends Entity {
        id: number;
      }
      class Account extends Entity {
        id: number;
        name: string;
      }
      class Customer extends Entity {
        id: number;

        @property.array(Order)
        @hasMany({modelTo: Order})
        orders: Order[];

        @hasMany({modelTo: Account})
        accounts: Account[];
      }

      const ordersMeta = MetadataInspector.getPropertyMetadata(
        RELATIONS_KEY,
        Customer.prototype,
        'orders',
      );

      const accountsMeta = MetadataInspector.getPropertyMetadata(
        RELATIONS_KEY,
        Customer.prototype,
        'accounts',
      );

      expect(ordersMeta).to.eql({
        type: RelationType.hasMany,
        modelTo: Order,
        modelFrom: Customer,
        as: 'orders',
      });

      expect(accountsMeta).to.eql({
        type: RelationType.hasMany,
        modelFrom: Customer,
        modelTo: Account,
        as: 'accounts',
      });
    });
  });
});
