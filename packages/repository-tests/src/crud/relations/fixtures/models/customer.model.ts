// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  belongsTo,
  EntityCrudRepository,
  hasMany,
  HasManyRepositoryFactory,
  HasManyThroughRepositoryFactory,
  hasOne,
  HasOneRepositoryFactory,
  model,
  property,
} from '@loopback/repository';
import {BelongsToAccessor} from '@loopback/repository/src';
import {MixedIdType} from '../../../../helpers.repository-tests';
import {Address, AddressWithRelations} from './address.model';
import {CartItem, CartItemWithRelations} from './cart-item.model';
import {Contact, ContactWithRelations} from './contact.model';
import {CustomerCartItemLink} from './customer-cart-item-link.model';
import {CustomerPromotionLink} from './customer-promotion-link.model';
import {Order, OrderWithRelations} from './order.model';
import {
  PaymentMethod,
  PaymentMethodWithRelations,
} from './payment-method.model';
import {Promotion, PromotionWithRelations} from './promotion.model';
import {Stakeholder} from './stakeholder.model';

@model()
export class Customer extends Stakeholder {
  @property({
    type: 'string',
  })
  name: string;

  @hasMany(() => Order)
  orders: Order[];

  @hasOne(() => Address)
  address: Address;

  @hasMany(() => Customer, {keyTo: 'parentId'})
  customers?: Customer[];

  @belongsTo(() => Customer)
  parentId?: MixedIdType;

  @hasMany(() => CartItem, {through: {model: () => CustomerCartItemLink}})
  cartItems: CartItem[];

  @hasMany(() => Promotion, {
    through: {
      model: () => CustomerPromotionLink,
      keyTo: 'promotion_id',
      polymorphic: {discriminator: 'promotiontype'},
    },
  })
  promotions: Promotion[];

  @hasOne(() => PaymentMethod, {polymorphic: true})
  paymentMethod: PaymentMethod;

  @property({
    type: 'string',
    required: true,
    default: 'CreditCard',
  })
  paymentMethodType: string;
}

export interface CustomerRelations {
  address?: AddressWithRelations;
  orders?: OrderWithRelations[];
  customers?: CustomerWithRelations[];
  parentCustomer?: CustomerWithRelations;
  cartItems?: CartItemWithRelations[];
  paymentMethod: PaymentMethodWithRelations;
  promotions?: PromotionWithRelations[];
  contact?: ContactWithRelations;
}

export type CustomerWithRelations = Customer & CustomerRelations;

export interface CustomerRepository
  extends EntityCrudRepository<Customer, typeof Customer.prototype.id> {
  // define additional members like relation methods here
  address: HasOneRepositoryFactory<Address, MixedIdType>;
  orders: HasManyRepositoryFactory<Order, MixedIdType>;
  customers: HasManyRepositoryFactory<Customer, MixedIdType>;
  parent: BelongsToAccessor<Customer, MixedIdType>;
  cartItems: HasManyThroughRepositoryFactory<
    CartItem,
    MixedIdType,
    CustomerCartItemLink,
    MixedIdType
  >;
  promotions: HasManyThroughRepositoryFactory<
    Promotion,
    MixedIdType,
    CustomerPromotionLink,
    MixedIdType
  >;
  paymentMethod: HasOneRepositoryFactory<PaymentMethod, MixedIdType>;
  contact: HasOneRepositoryFactory<Contact, MixedIdType>;
}
