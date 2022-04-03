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
  Customer,
  CustomerPromotionLink,
  CustomerPromotionLinkRepository,
  CustomerRepository,
  FreeDelivery,
  FreeDeliveryRepository,
  HalfPrice,
  HalfPriceRepository,
} from '../fixtures/models';
import {givenBoundCrudRepositories} from '../helpers';

export function hasManyThroughInclusionResolverPolymorphicAcceptance(
  dataSourceOptions: DataSourceOptions,
  repositoryClass: CrudRepositoryCtor,
  features: CrudFeatures,
) {
  skipIf<[(this: Suite) => void], void>(
    !features.supportsInclusionResolvers,
    describe,
    'HasManyThrough inclusion resolvers - polymorphic - acceptance',
    suite,
  );
  function suite() {
    describe('HasManyThrough inclusion resolver', () => {
      before(deleteAllModelsInDefaultDataSource);
      let customerRepo: CustomerRepository;
      let freeDeliveryRepo: FreeDeliveryRepository;
      let halfPriceRepo: HalfPriceRepository;
      let customerPromotionLinkRepo: CustomerPromotionLinkRepository;

      before(
        withCrudCtx(async function setupRepository(ctx: CrudTestContext) {
          // this helper should create the inclusion resolvers and also
          // register inclusion resolvers for us
          ({
            customerRepo,
            freeDeliveryRepo,
            halfPriceRepo,
            customerPromotionLinkRepo,
          } = givenBoundCrudRepositories(
            ctx.dataSource,
            repositoryClass,
            features,
          ));
          expect(customerRepo.promotions.inclusionResolver).to.be.Function();

          await ctx.dataSource.automigrate([
            Customer.name,
            FreeDelivery.name,
            HalfPrice.name,
            CustomerPromotionLink.name,
          ]);
        }),
      );

      beforeEach(async () => {
        await customerRepo.deleteAll();
        await freeDeliveryRepo.deleteAll();
        await halfPriceRepo.deleteAll();
        await customerPromotionLinkRepo.deleteAll();
      });

      it('throws an error if tries to query nonexistent relation names', async () => {
        const customer = await customerRepo.create({name: 'customer'});
        await customerRepo
          .promotions(customer.id)
          .create({description: 'crown'}, {polymorphicType: 'HalfPrice'});

        await expect(
          customerRepo.find({include: ['crown']}),
        ).to.be.rejectedWith(`Invalid "filter.include" entries: "crown"`);
      });

      it('returns single model instance including single related instance', async () => {
        const zelda = await customerRepo.create({name: 'Zelda'});
        const freeDelivery = await customerRepo.promotions(zelda.id).create(
          {description: 'crown'},
          {
            throughData: {promotiontype: 'FreeDelivery'},
            polymorphicType: 'FreeDelivery',
          },
        );

        const result = await customerRepo.find({
          include: ['promotions'],
        });

        expect(toJSON(result)).to.deepEqual([
          toJSON({
            ...zelda,
            parentId: features.emptyValue,
            promotions: [freeDelivery],
          }),
        ]);
      });

      it('returns multiple model instances including related instances', async () => {
        const link = await customerRepo.create({name: 'Link'});
        const halfPrice = await customerRepo.promotions(link.id).create(
          {description: 'halfPrice'},
          {
            throughData: {promotiontype: 'HalfPrice'},
            polymorphicType: 'HalfPrice',
          },
        );
        const freeDelivery = await customerRepo.promotions(link.id).create(
          {description: 'freeDelivery'},
          {
            throughData: {promotiontype: 'FreeDelivery'},
            polymorphicType: 'FreeDelivery',
          },
        );
        const freeDelivery2 = await customerRepo.promotions(link.id).create(
          {description: 'freeDelivery 2'},
          {
            throughData: {promotiontype: 'FreeDelivery'},
            polymorphicType: 'FreeDelivery',
          },
        );

        const result = await customerRepo.find({
          include: ['promotions'],
        });

        const expected = [
          {
            ...link,
            parentId: features.emptyValue,
            promotions: [halfPrice, freeDelivery, freeDelivery2],
          },
        ];

        expect(toJSON(result)).to.deepEqual(toJSON(expected));
      });

      it('returns a specified instance including its related model instances', async () => {
        const link = await customerRepo.create({name: 'Link'});
        const zelda = await customerRepo.create({name: 'Zelda'});

        await customerRepo.promotions(link.id).create(
          {description: 'crown'},
          {
            throughData: {promotiontype: 'HalfPrice'},
            polymorphicType: 'HalfPrice',
          },
        );
        const zeldaPromotion1 = await customerRepo.promotions(zelda.id).create(
          {description: 'shield'},
          {
            throughData: {promotiontype: 'FreeDelivery'},
            polymorphicType: 'FreeDelivery',
          },
        );
        const zeldaPromotion2 = await customerRepo.promotions(zelda.id).create(
          {description: 'green hat'},
          {
            throughData: {promotiontype: 'FreeDelivery'},
            polymorphicType: 'FreeDelivery',
          },
        );

        const result = await customerRepo.findById(zelda.id, {
          include: ['promotions'],
        });
        const expected = {
          ...zelda,
          parentId: features.emptyValue,
          promotions: [zeldaPromotion1, zeldaPromotion2],
        };
        expect(toJSON(result)).to.deepEqual(toJSON(expected));
      });

      it('honours field scope when returning a model', async () => {
        const link = await customerRepo.create({name: 'Link'});
        const zelda = await customerRepo.create({name: 'Zelda'});
        const sword = await customerRepo.promotions(link.id).create(
          {description: 'master sword'},
          {
            throughData: {promotiontype: 'HalfPrice'},
            polymorphicType: 'HalfPrice',
          },
        );
        const shield = await customerRepo.promotions(zelda.id).create(
          {description: 'shield'},
          {
            throughData: {promotiontype: 'FreeDelivery'},
            polymorphicType: 'FreeDelivery',
          },
        );
        const hat = await customerRepo.promotions(zelda.id).create(
          {description: 'hat'},
          {
            throughData: {promotiontype: 'HalfPrice'},
            polymorphicType: 'HalfPrice',
          },
        );

        const result = await customerRepo.find({
          include: [{relation: 'promotions', scope: {fields: {id: false}}}],
        });

        const expected = [
          {
            ...link,
            parentId: features.emptyValue,
            promotions: [{description: sword.description}],
          },
          {
            ...zelda,
            parentId: features.emptyValue,
            promotions: [
              {description: shield.description},
              {description: hat.description},
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
  }
}
