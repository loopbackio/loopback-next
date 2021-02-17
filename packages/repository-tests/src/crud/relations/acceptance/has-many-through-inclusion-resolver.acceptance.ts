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
  Order,
  OrderRepository,
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
      let orderRepo: OrderRepository;

      before(
        withCrudCtx(async function setupRepository(ctx: CrudTestContext) {
          // this helper should create the inclusion resolvers and also
          // register inclusion resolvers for us
          ({
            customerRepo,
            cartItemRepo,
            customerCartItemLinkRepo,
            orderRepo,
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
            Order.name,
          ]);
        }),
      );

      beforeEach(async () => {
        await customerRepo.deleteAll();
        await cartItemRepo.deleteAll();
        await customerCartItemLinkRepo.deleteAll();
        await orderRepo.deleteAll();
      });

      it('throws an error if tries to query nonexistent relation names', async () => {
        const customer = await customerRepo.create({name: 'customer'});
        await customerRepo
          .cartItems(customer.id)
          .create({description: 'crown'});

        await expect(
          customerRepo.find({include: ['crown']}),
        ).to.be.rejectedWith(`Invalid "filter.include" entries: "crown"`);
      });

      it('returns single model instance including single related instance', async () => {
        const zelda = await customerRepo.create({name: 'Zelda'});
        const cartItem = await customerRepo
          .cartItems(zelda.id)
          .create({description: 'crown'});

        const result = await customerRepo.find({
          include: ['cartItems'],
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
          include: ['cartItems'],
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
          include: ['cartItems'],
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

      it('finds models with nested inclusion', async () => {
        const o1 = await orderRepo.create({description: 'order 1'});
        const o2 = await orderRepo.create({description: 'order 2'});
        const o3 = await orderRepo.create({description: 'order 3'});

        const link = await customerRepo.create({name: 'Link'});
        const sword = await customerRepo
          .cartItems(link.id)
          .create({description: 'master sword', orderId: o2.id});
        const shield = await customerRepo
          .cartItems(link.id)
          .create({description: 'shield', orderId: o1.id});

        const zelda = await customerRepo.create({name: 'Zelda'});
        const force = await customerRepo
          .cartItems(zelda.id)
          .create({description: 'Triforce', orderId: o3.id});

        const result = await customerRepo.find({
          include: [{relation: 'cartItems', scope: {include: ['order']}}],
        });

        const empty = {
          isShipped: features.emptyValue,
          shipmentInfo: features.emptyValue,
        };

        const expected = [
          {
            ...link,
            parentId: features.emptyValue,
            cartItems: [
              {
                ...sword,
                order: {
                  ...o2,
                  ...empty,
                },
              },
              {
                ...shield,
                order: {
                  ...o1,
                  ...empty,
                },
              },
            ],
          },
          {
            ...zelda,
            parentId: features.emptyValue,
            cartItems: [
              {
                ...force,
                order: {
                  ...o3,
                  ...empty,
                },
              },
            ],
          },
        ];
        expect(toJSON(result)).to.deepEqual(toJSON(expected));
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
          include: ['users'],
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
          include: ['users'],
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
