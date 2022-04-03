// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter} from '@loopback/core';
import {
  BelongsToAccessor,
  BelongsToDefinition,
  createBelongsToAccessor,
  createHasManyRepositoryFactory,
  createHasManyThroughRepositoryFactory,
  createHasOneRepositoryFactory,
  HasManyDefinition,
  HasManyRepositoryFactory,
  HasManyThroughRepositoryFactory,
  HasOneDefinition,
  HasOneRepositoryFactory,
  juggler,
} from '@loopback/repository';
import {CrudRepositoryCtor} from '../../../../types.repository-tests';
import {
  Address,
  CartItem,
  Contact,
  Customer,
  CustomerCartItemLink,
  CustomerPromotionLink,
  CustomerRelations,
  Order,
  PaymentMethod,
  Promotion,
} from '../models';

// create the CustomerRepo by calling this func so that it can be extended from CrudRepositoryCtor
export function createCustomerRepo(repoClass: CrudRepositoryCtor) {
  return class CustomerRepository extends repoClass<
    Customer,
    typeof Customer.prototype.id,
    CustomerRelations
  > {
    public readonly orders: HasManyRepositoryFactory<
      Order,
      typeof Customer.prototype.id
    >;
    public readonly address: HasOneRepositoryFactory<
      Address,
      typeof Customer.prototype.id
    >;
    public readonly customers: HasManyRepositoryFactory<
      Customer,
      typeof Customer.prototype.id
    >;
    public readonly parent: BelongsToAccessor<
      Customer,
      typeof Customer.prototype.id
    >;
    public readonly cartItems: HasManyThroughRepositoryFactory<
      CartItem,
      typeof CartItem.prototype.id,
      CustomerCartItemLink,
      typeof CustomerCartItemLink.prototype.id
    >;

    public readonly promotions: HasManyThroughRepositoryFactory<
      Promotion,
      typeof Promotion.prototype.id,
      CustomerPromotionLink,
      typeof CustomerPromotionLink.prototype.id
    >;

    public readonly paymentMethod: HasOneRepositoryFactory<
      PaymentMethod,
      typeof Customer.prototype.id
    >;

    public readonly contact: HasOneRepositoryFactory<
      Contact,
      typeof Customer.prototype.id
    >;

    constructor(
      db: juggler.DataSource,
      orderRepositoryGetter: Getter<typeof repoClass.prototype>,
      addressRepositoryGetter: Getter<typeof repoClass.prototype>,
      cartItemRepositoryGetter: Getter<typeof repoClass.prototype>,
      customerCartItemLinkRepositoryGetter: Getter<typeof repoClass.prototype>,
      promotionRepositoryGetter: {
        [repoType: string]: Getter<typeof repoClass.prototype>;
      },
      customerPromotionLinkRepositoryGetter: Getter<typeof repoClass.prototype>,
      paymentMethodRepositoryGetter: {
        [repoType: string]: Getter<typeof repoClass.prototype>;
      },
      contactRepositoryGetter: Getter<typeof repoClass.prototype>,
    ) {
      super(Customer, db);
      const ordersMeta = this.entityClass.definition.relations['orders'];
      // create a has-many relation through this public method
      this.orders = createHasManyRepositoryFactory(
        ordersMeta as HasManyDefinition,
        orderRepositoryGetter,
      );

      const addressMeta = this.entityClass.definition.relations['address'];
      this.address = createHasOneRepositoryFactory(
        addressMeta as HasOneDefinition,
        addressRepositoryGetter,
      );
      const customersMeta = this.entityClass.definition.relations['customers'];
      this.customers = createHasManyRepositoryFactory(
        customersMeta as HasManyDefinition,
        Getter.fromValue(this),
      );
      const parentMeta = this.entityClass.definition.relations['parent'];
      this.parent = createBelongsToAccessor(
        parentMeta as BelongsToDefinition,
        Getter.fromValue(this),
        this,
      );
      const cartItemsMeta = this.entityClass.definition.relations['cartItems'];
      this.cartItems = createHasManyThroughRepositoryFactory(
        cartItemsMeta as HasManyDefinition,
        cartItemRepositoryGetter,
        customerCartItemLinkRepositoryGetter,
      );
      const promotionsMeta =
        this.entityClass.definition.relations['promotions'];
      this.promotions = createHasManyThroughRepositoryFactory(
        promotionsMeta as HasManyDefinition,
        promotionRepositoryGetter,
        customerPromotionLinkRepositoryGetter,
      );
      const paymentMethodMeta =
        this.entityClass.definition.relations['paymentMethod'];
      this.paymentMethod = createHasOneRepositoryFactory(
        paymentMethodMeta as HasOneDefinition,
        paymentMethodRepositoryGetter,
      );
      const contactMeta = this.entityClass.definition.relations['contact'];
      this.contact = createHasOneRepositoryFactory(
        contactMeta as HasOneDefinition,
        contactRepositoryGetter,
      );
    }
  };
}
