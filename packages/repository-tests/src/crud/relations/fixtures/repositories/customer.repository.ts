// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter} from '@loopback/context';
import {
  BelongsToAccessor,
  BelongsToDefinition,
  createBelongsToAccessor,
  createHasManyRepositoryFactory,
  createHasManyThroughRepositoryFactory,
  createHasOneRepositoryFactory,
  HasManyDefinition,
  HasManyRepositoryFactory,
  HasManyThroughDefinition,
  HasManyThroughRepositoryFactory,
  HasOneDefinition,
  HasOneRepositoryFactory,
  juggler,
} from '@loopback/repository';
import {CrudRepositoryCtor} from '../../../../types.repository-tests';
import {Address, Customer, CustomerRelations, Order, Seller} from '../models';

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
    public readonly sellers: HasManyThroughRepositoryFactory<
      Seller,
      typeof Seller.prototype.id,
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

    constructor(
      db: juggler.DataSource,
      orderRepositoryGetter: Getter<typeof repoClass.prototype>,
      addressRepositoryGetter: Getter<typeof repoClass.prototype>,
      sellersRepositoryGetter: Getter<typeof repoClass.prototype>,
    ) {
      super(Customer, db);
      const ordersMeta = this.entityClass.definition.relations['orders'];
      // create a has-many relation through this public method
      this.orders = createHasManyRepositoryFactory(
        ordersMeta as HasManyDefinition,
        orderRepositoryGetter,
      );

      const sellersMeta = this.entityClass.definition.relations['sellers'];
      this.sellers = createHasManyThroughRepositoryFactory(
        sellersMeta as HasManyThroughDefinition,
        sellersRepositoryGetter,
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
    }
  };
}
