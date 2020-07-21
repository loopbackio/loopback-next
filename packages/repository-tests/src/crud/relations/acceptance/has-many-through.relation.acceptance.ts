// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect, toJSON} from '@loopback/testlab';
import {
  CrudFeatures,
  CrudRepositoryCtor,
  CrudTestContext,
  DataSourceOptions,
} from '../../..';
import {
  deleteAllModelsInDefaultDataSource,
  MixedIdType,
  withCrudCtx,
} from '../../../helpers.repository-tests';
import {
  CartItem,
  CartItemRepository,
  Customer,
  CustomerCartItemLink,
  CustomerCartItemLinkRepository,
  CustomerRepository,
  User,
  UserRepository,
  UserLink,
  UserLinkRepository,
} from '../fixtures/models';
import {givenBoundCrudRepositories} from '../helpers';

export function hasManyThroughRelationAcceptance(
  dataSourceOptions: DataSourceOptions,
  repositoryClass: CrudRepositoryCtor,
  features: CrudFeatures,
) {
  describe('HasManyThrough relation (acceptance)', () => {
    before(deleteAllModelsInDefaultDataSource);
    let customerRepo: CustomerRepository;
    let cartItemRepo: CartItemRepository;
    let customerCartItemLinkRepo: CustomerCartItemLinkRepository;
    let existingCustomerId: MixedIdType;

    before(
      withCrudCtx(async function setupRepository(ctx: CrudTestContext) {
        ({
          customerRepo,
          cartItemRepo,
          customerCartItemLinkRepo,
        } = givenBoundCrudRepositories(
          ctx.dataSource,
          repositoryClass,
          features,
        ));
        await ctx.dataSource.automigrate([
          Customer.name,
          CartItem.name,
          CustomerCartItemLink.name,
        ]);
      }),
    );

    beforeEach(async () => {
      await customerRepo.deleteAll();
      await cartItemRepo.deleteAll();
      await customerCartItemLinkRepo.deleteAll();
    });

    beforeEach(async () => {
      existingCustomerId = (await givenPersistedCustomerInstance()).id;
    });

    it('creates an instance of the related model alone with a through model', async () => {
      const item = await customerRepo
        .cartItems(existingCustomerId)
        .create(
          {description: 'an item'},
          {throughData: {description: 'a through model'}},
        );

      expect(toJSON(item)).containDeep(
        toJSON({
          id: item.id,
          description: 'an item',
        }),
      );

      const persistedItem = await cartItemRepo.findById(item.id);
      expect(toJSON(persistedItem)).to.deepEqual(toJSON(item));
      const persistedLink = await customerCartItemLinkRepo.find();
      expect(toJSON(persistedLink[0])).to.containDeep(
        toJSON({
          customerId: existingCustomerId,
          cartItemId: item.id,
          description: 'a through model',
        }),
      );
    });

    it('finds instances of the related model', async () => {
      const item = await customerRepo
        .cartItems(existingCustomerId)
        .create(
          {description: 'an item'},
          {throughData: {description: 'a through model'}},
        );
      const notMyItem = await cartItemRepo.create({
        description: "someone else's item",
      });
      const result = await customerRepo.cartItems(existingCustomerId).find();
      expect(toJSON(result)).to.containDeep(toJSON([item]));
      expect(toJSON(result[0])).to.not.containEql(toJSON(notMyItem));
    });

    it('patches instances', async () => {
      const item1 = await customerRepo
        .cartItems(existingCustomerId)
        .create({description: 'group 1'});
      const item2 = await customerRepo
        .cartItems(existingCustomerId)
        .create({description: 'group 1'});
      const count = await customerRepo
        .cartItems(existingCustomerId)
        .patch({description: 'updated'});

      expect(count.count).to.equal(2);
      const result = await customerRepo.cartItems(existingCustomerId).find();
      expect(toJSON(result)).to.containDeep(
        toJSON([
          {id: item1.id, description: 'updated'},
          {id: item2.id, description: 'updated'},
        ]),
      );
    });

    it('patches an instance based on the filter', async () => {
      const item1 = await customerRepo
        .cartItems(existingCustomerId)
        .create({description: 'group 1'});
      const item2 = await customerRepo
        .cartItems(existingCustomerId)
        .create({description: 'group 1'});
      const count = await customerRepo
        .cartItems(existingCustomerId)
        .patch({description: 'group 2'}, {id: item2.id});

      expect(count.count).to.equal(1);
      const result = await customerRepo.cartItems(existingCustomerId).find();
      expect(toJSON(result)).to.containDeep(
        toJSON([
          {id: item1.id, description: 'group 1'},
          {id: item2.id, description: 'group 2'},
        ]),
      );
    });

    it('throws error when query tries to change the target id', async () => {
      // a diff id for CartItem instance
      const anotherId = (await givenPersistedCustomerInstance()).id;
      await customerRepo
        .cartItems(existingCustomerId)
        .create({description: 'group 1'});

      await expect(
        customerRepo.cartItems(existingCustomerId).patch({id: anotherId}),
      ).to.be.rejectedWith(/Property "id" cannot be changed!/);
    });

    it('deletes many instances and their through models', async () => {
      await customerRepo
        .cartItems(existingCustomerId)
        .create({description: 'group 1'});
      await customerRepo
        .cartItems(existingCustomerId)
        .create({description: 'group 1'});

      let links = await customerCartItemLinkRepo.find();
      let cartItems = await cartItemRepo.find();
      expect(links).have.length(2);
      expect(cartItems).have.length(2);

      await customerRepo.cartItems(existingCustomerId).delete();
      links = await customerCartItemLinkRepo.find();
      cartItems = await cartItemRepo.find();
      expect(links).have.length(0);
      expect(cartItems).have.length(0);
    });

    it('deletes corresponding through models when the target gets deleted', async () => {
      const item = await customerRepo
        .cartItems(existingCustomerId)
        .create({description: 'group 1'});
      const anotherId = (await givenPersistedCustomerInstance()).id;
      // another through model that links to the same item
      await customerCartItemLinkRepo.create({
        customerId: anotherId,
        cartItemId: item.id,
      });

      let links = await customerCartItemLinkRepo.find();
      let cartItems = await cartItemRepo.find();
      expect(links).have.length(2);
      expect(cartItems).have.length(1);

      await customerRepo.cartItems(existingCustomerId).delete();
      links = await customerCartItemLinkRepo.find();
      cartItems = await cartItemRepo.find();
      expect(links).have.length(0);
      expect(cartItems).have.length(0);
    });

    it('deletes instances based on the filter', async () => {
      const item1 = await customerRepo
        .cartItems(existingCustomerId)
        .create({description: 'group 1'});
      await customerRepo
        .cartItems(existingCustomerId)
        .create({description: 'group 2'});

      let links = await customerCartItemLinkRepo.find();
      let cartItems = await cartItemRepo.find();
      expect(links).have.length(2);
      expect(cartItems).have.length(2);

      await customerRepo
        .cartItems(existingCustomerId)
        .delete({description: 'does not exist'});
      links = await customerCartItemLinkRepo.find();
      cartItems = await cartItemRepo.find();
      expect(links).have.length(2);
      expect(cartItems).have.length(2);

      await customerRepo
        .cartItems(existingCustomerId)
        .delete({description: 'group 2'});
      links = await customerCartItemLinkRepo.find();
      cartItems = await cartItemRepo.find();
      expect(links).have.length(1);
      expect(toJSON(cartItems)).to.containDeep(
        toJSON([{id: item1.id, description: 'group 1'}]),
      );
    });

    it('links a target model to a source model', async () => {
      const item = await cartItemRepo.create({description: 'an item'});

      let targets = await customerRepo.cartItems(existingCustomerId).find();
      expect(targets).to.be.empty();

      await customerRepo.cartItems(existingCustomerId).link(item.id);

      targets = await customerRepo.cartItems(existingCustomerId).find();
      expect(targets).to.deepEqual([item]);

      const link = await customerCartItemLinkRepo.find();
      expect(toJSON(link[0])).to.containEql(
        toJSON({customerId: existingCustomerId, cartItemId: item.id}),
      );
    });

    it('unlinks a target model from a source model', async () => {
      const item = await customerRepo
        .cartItems(existingCustomerId)
        .create({description: 'an item'});

      let targets = await customerRepo.cartItems(existingCustomerId).find();
      expect(targets).to.deepEqual([item]);

      await customerRepo.cartItems(existingCustomerId).unlink(item.id);

      targets = await customerRepo.cartItems(existingCustomerId).find();
      expect(targets).to.be.empty();

      const link = await customerCartItemLinkRepo.find();
      expect(link).to.be.empty();
    });

    async function givenPersistedCustomerInstance() {
      return customerRepo.create({name: 'a customer'});
    }
  });
  describe('HasManyThrough relation - self through', () => {
    before(deleteAllModelsInDefaultDataSource);
    let userRepo: UserRepository;
    let userLinkRepo: UserLinkRepository;
    let existedUserId: MixedIdType;

    before(
      withCrudCtx(async function setupRepository(ctx: CrudTestContext) {
        ({userRepo, userLinkRepo} = givenBoundCrudRepositories(
          ctx.dataSource,
          repositoryClass,
          features,
        ));
        await ctx.dataSource.automigrate([User.name, UserLink.name]);
      }),
    );

    beforeEach(async () => {
      await userRepo.deleteAll();
      await userLinkRepo.deleteAll();
    });

    beforeEach(async () => {
      existedUserId = (await givenPersistedUserInstance()).id;
    });

    it('creates instances of self model', async () => {
      const followed = await userRepo
        .users(existedUserId)
        .create(
          {name: 'another user'},
          {throughData: {description: 'a through model - UserLink'}},
        );

      const persistedUser = await userRepo.findById(followed.id);
      const persistedLink = await userLinkRepo.find();
      expect(toJSON(persistedUser)).to.containDeep(toJSON(followed));
      expect(toJSON(persistedLink[0])).to.containDeep(
        toJSON({
          followerId: existedUserId,
          followeeId: followed.id,
          description: 'a through model - UserLink',
        }),
      );
    });

    it('finds an instance of self model alone with a through model', async () => {
      const followed = await userRepo
        .users(existedUserId)
        .create(
          {name: 'another user'},
          {throughData: {description: 'a through model - UserLink'}},
        );
      const notFollowed = await userRepo.create({
        name: 'not being followed',
      });

      const persistedUser = await userRepo.users(existedUserId).find();
      const persistedLink = await userLinkRepo.find();
      expect(toJSON(persistedUser[0])).to.deepEqual(toJSON(followed));
      expect(toJSON(persistedUser[0])).to.not.containEql(toJSON(notFollowed));
      expect(toJSON(persistedLink)).to.containDeep(
        toJSON([
          {
            followerId: existedUserId,
            followeeId: followed.id,
            description: 'a through model - UserLink',
          },
        ]),
      );
    });
    it('finds instances of self model', async () => {
      const u1 = await userRepo.create({name: 'u1'});
      const u2 = await userRepo.create({name: 'u2'});
      const u3 = await userRepo.create({name: 'u3'});
      await userRepo.users(u1.id).link(u2.id);
      await userRepo.users(u1.id).link(u3.id);
      await userRepo.users(u3.id).link(u1.id);

      const u1Following = await userRepo.users(u1.id).find();
      const u2Following = await userRepo.users(u2.id).find();
      const u3Following = await userRepo.users(u3.id).find();
      expect(toJSON(u1Following)).to.deepEqual(toJSON([u2, u3]));
      expect(toJSON(u2Following)).to.deepEqual(toJSON([]));
      expect(toJSON(u3Following)).to.not.containEql(toJSON([u1]));

      const persistedLink = await userLinkRepo.find();
      expect(persistedLink.length).to.equal(3);
    });

    async function givenPersistedUserInstance() {
      return userRepo.create({name: 'a user'});
    }
  });
}
