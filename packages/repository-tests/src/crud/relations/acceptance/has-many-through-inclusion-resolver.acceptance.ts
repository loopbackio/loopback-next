// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect, skipIf, toJSON} from '@loopback/testlab';
import {Suite} from 'mocha';
import {
  CrudFeatures,
  CrudRepositoryCtor,
  CrudTestContext,
  DataSourceOptions,
} from '../../..';
import {
  deleteAllModelsInDefaultDataSource,
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
  UserLink,
  UserLinkRepository,
  UserRepository,
} from '../fixtures/models';
import {givenBoundCrudRepositories} from '../helpers';

export function hasManyThroughInclusionResolverAcceptance(
  dataSourceOptions: DataSourceOptions,
  repositoryClass: CrudRepositoryCtor,
  features: CrudFeatures,
) {
  skipIf<[(this: Suite) => void], void>(
    !features.supportsInclusionResolvers,
    describe,
    'HasManyThrough inclusion resolvers - acceptance',
    suite,
  );
  function suite() {
    describe('HasManyThrough inclusion resolver', () => {
      before(deleteAllModelsInDefaultDataSource);
      let customerRepo: CustomerRepository;
      let cartItemRepo: CartItemRepository;
      let customerCartItemLinkRepo: CustomerCartItemLinkRepository;

      before(
        withCrudCtx(async function setupRepository(ctx: CrudTestContext) {
          // this helper should create the inclusion resolvers and also
          // register inclusion resolvers for us
          ({
            customerRepo,
            cartItemRepo,
            customerCartItemLinkRepo,
          } = givenBoundCrudRepositories(
            ctx.dataSource,
            repositoryClass,
            features,
          ));
          expect(customerRepo.cartItems.inclusionResolver).to.be.Function();

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

      it('throws an error if tries to query nonexistent relation names', async () => {
        const customer = await customerRepo.create({name: 'customer'});
        await customerRepo
          .cartItems(customer.id)
          .create({description: 'crown'});

        await expect(
          customerRepo.find({include: [{relation: 'crown'}]}),
        ).to.be.rejectedWith(
          `Invalid "filter.include" entries: {"relation":"crown"}`,
        );
      });

      it('returns single model instance including single related instance', async () => {
        const zelda = await customerRepo.create({name: 'Zelda'});
        const cartItem = await customerRepo
          .cartItems(zelda.id)
          .create({description: 'crown'});

        const result = await customerRepo.find({
          include: [{relation: 'cartItems'}],
        });

        expect(toJSON(result)).to.deepEqual([
          toJSON({
            ...zelda,
            parentId: features.emptyValue,
            cartItems: [cartItem],
          }),
        ]);
      });

      it('returns multiple model instances including related instances', async () => {
        const link = await customerRepo.create({name: 'Link'});
        const sword = await customerRepo
          .cartItems(link.id)
          .create({description: 'master sword'});
        const shield = await customerRepo
          .cartItems(link.id)
          .create({description: 'shield'});
        const hat = await customerRepo
          .cartItems(link.id)
          .create({description: 'green hat'});

        const result = await customerRepo.find({
          include: [{relation: 'cartItems'}],
        });

        const expected = [
          {
            ...link,
            parentId: features.emptyValue,
            cartItems: [sword, shield, hat],
          },
        ];

        expect(toJSON(result)).to.deepEqual(toJSON(expected));
      });

      it('returns a specified instance including its related model instances', async () => {
        const link = await customerRepo.create({name: 'Link'});
        const zelda = await customerRepo.create({name: 'Zelda'});

        const zeldaCart = await customerRepo
          .cartItems(zelda.id)
          .create({description: 'crown'});
        await customerRepo.cartItems(link.id).create({description: 'shield'});
        await customerRepo
          .cartItems(link.id)
          .create({description: 'green hat'});

        const result = await customerRepo.findById(zelda.id, {
          include: [{relation: 'cartItems'}],
        });
        const expected = {
          ...zelda,
          parentId: features.emptyValue,
          cartItems: [zeldaCart],
        };
        expect(toJSON(result)).to.deepEqual(toJSON(expected));
      });

      it('honours field scope when returning a model', async () => {
        const link = await customerRepo.create({name: 'Link'});
        const sword = await customerRepo
          .cartItems(link.id)
          .create({description: 'master sword'});
        const shield = await customerRepo
          .cartItems(link.id)
          .create({description: 'shield'});

        const result = await customerRepo.find({
          include: [{relation: 'cartItems', scope: {fields: {id: false}}}],
        });

        const expected = [
          {
            ...link,
            parentId: features.emptyValue,
            cartItems: [
              {description: sword.description},
              {description: shield.description},
            ],
          },
        ];

        expect(toJSON(result)).to.deepEqual(toJSON(expected));
      });

      it('honours limit scope when returning a model', async () => {
        const link = await customerRepo.create({name: 'Link'});
        await customerRepo
          .cartItems(link.id)
          .create({description: 'master sword'});
        await customerRepo.cartItems(link.id).create({description: 'shield'});

        const result = await customerRepo.find({
          include: [{relation: 'cartItems', scope: {limit: 1}}],
        });

        expect(result.length).to.eql(1);
        expect(result[0].cartItems.length).to.eql(1);
      });
    });

    describe('HasManyThrough inclusion resolver - self through', () => {
      before(deleteAllModelsInDefaultDataSource);
      let userRepo: UserRepository;
      let userLinkRepo: UserLinkRepository;

      before(
        withCrudCtx(async function setupRepository(ctx: CrudTestContext) {
          ({userRepo, userLinkRepo} = givenBoundCrudRepositories(
            ctx.dataSource,
            repositoryClass,
            features,
          ));
          expect(userRepo.users.inclusionResolver).to.be.Function();
          await ctx.dataSource.automigrate([User.name, UserLink.name]);
        }),
      );

      beforeEach(async () => {
        await userRepo.deleteAll();
        await userLinkRepo.deleteAll();
      });

      it('returns single model instance including single related instance', async () => {
        const link = await userRepo.create({name: 'Link'});
        const zelda = await userRepo.users(link.id).create({name: 'zelda'});

        const result = await userRepo.findById(link.id, {
          include: [{relation: 'users'}],
        });

        expect(toJSON(result)).to.deepEqual(
          toJSON({
            ...link,
            users: [zelda],
          }),
        );
      });

      it('returns multiple model instances including related instances', async () => {
        const link = await userRepo.create({name: 'Link'});
        const zelda = await userRepo.users(link.id).create({name: 'zelda'});
        const ganon = await userRepo.users(link.id).create({name: 'ganon'});
        const hilda = await userRepo.users(link.id).create({name: 'hilda'});

        const result = await userRepo.find({
          include: [{relation: 'users'}],
        });

        const expected = [
          {...link, users: [zelda, ganon, hilda]},
          {...zelda},
          {...ganon},
          {...hilda},
        ];

        expect(toJSON(result)).to.deepEqual(toJSON(expected));
      });
    });
  }
}
