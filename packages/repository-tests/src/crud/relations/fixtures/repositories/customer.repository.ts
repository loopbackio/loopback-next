// Copyright The LoopBack Authors 2019,2021. All Rights Reserved.
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
  Customer,
  CustomerCartItemLink,
  CustomerRelations,
  Order,
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

    constructor(
      db: juggler.DataSource,
      orderRepositoryGetter: Getter<typeof repoClass.prototype>,
      addressRepositoryGetter: Getter<typeof repoClass.prototype>,
      cartItemRepositoryGetter: Getter<typeof repoClass.prototype>,
      customerCartItemLinkRepositoryGetter: Getter<typeof repoClass.prototype>,
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
    }
  };
}
