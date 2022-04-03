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

export function hasManyThroughRelationAcceptance(
  dataSourceOptions: DataSourceOptions,
  repositoryClass: CrudRepositoryCtor,
  features: CrudFeatures,
) {
  describe('HasManyThrough relation polymorphic (acceptance)', () => {
    before(deleteAllModelsInDefaultDataSource);
    let customerRepo: CustomerRepository;
    let freeDeliveryRepo: FreeDeliveryRepository;
    let halfPriceRepo: HalfPriceRepository;
    let customerPromotionLinkRepo: CustomerPromotionLinkRepository;
    let existingCustomerId: MixedIdType;

    before(
      withCrudCtx(async function setupRepository(ctx: CrudTestContext) {
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

    beforeEach(async () => {
      existingCustomerId = (await givenPersistedCustomerInstance()).id;
    });

    it('creates an instance of the related model alone with a through model', async () => {
      const promo = await customerRepo.promotions(existingCustomerId).create(
        {description: 'free delivery promo'},
        {
          throughData: {
            description: 'a through model',
            promotiontype: 'FreeDelivery',
          },
          polymorphicType: 'FreeDelivery',
        },
      );

      expect(toJSON(promo)).containDeep(
        toJSON({
          id: promo.id,
          description: 'free delivery promo',
        }),
      );

      const persistedPromo = await freeDeliveryRepo.findById(promo.id);
      expect(toJSON(persistedPromo)).to.deepEqual(toJSON(promo));
      const persistedLink = await customerPromotionLinkRepo.find();
      expect(toJSON(persistedLink[0])).to.containDeep(
        toJSON({
          customerId: existingCustomerId,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          promotion_id: promo.id,
          description: 'a through model',
        }),
      );
    });

    it('finds instances of the related model', async () => {
      const freeDelivery = await customerRepo
        .promotions(existingCustomerId)
        .create(
          {description: 'free delivery promo'},
          {
            throughData: {
              description: 'a through model',
              promotiontype: 'FreeDelivery',
            },
            polymorphicType: 'FreeDelivery',
          },
        );
      const notMyPromo = await freeDeliveryRepo.create({
        description: "someone else's promo",
      });
      const notMyPromo2 = await halfPriceRepo.create({
        description: "someone else's promo 2",
      });
      const result = await customerRepo
        .promotions(existingCustomerId)
        .find(undefined, {
          throughOptions: {discriminator: 'promotiontype'},
          polymorphicType: ['FreeDelivery'],
        });
      expect(toJSON(result)).to.containDeep(toJSON([freeDelivery]));
      expect(toJSON(result[0])).to.not.containEql(toJSON(notMyPromo));
      expect(toJSON(result[0])).to.not.containEql(toJSON(notMyPromo2));
    });

    it('patches instances', async () => {
      const promo1 = await customerRepo.promotions(existingCustomerId).create(
        {description: 'free delivery promo'},
        {
          throughData: {
            description: 'a through model',
            promotiontype: 'FreeDelivery',
          },
          polymorphicType: 'FreeDelivery',
        },
      );
      const promo2 = await customerRepo.promotions(existingCustomerId).create(
        {description: 'half price promo 2'},
        {
          throughData: {
            description: 'a through model',
            promotiontype: 'HalfPrice',
          },
          polymorphicType: 'HalfPrice',
        },
      );
      const promo3 = await customerRepo.promotions(existingCustomerId).create(
        {description: 'free delivery promo 3'},
        {
          throughData: {
            description: 'a through model',
            promotiontype: 'FreeDelivery',
          },
          polymorphicType: 'FreeDelivery',
        },
      );
      const count = await customerRepo.promotions(existingCustomerId).patch(
        {
          FreeDelivery: {description: 'updated free delivery'},
          HalfPrice: {description: 'updated half price'},
        },
        undefined,
        {
          throughOptions: {discriminator: 'promotiontype'},
          isPolymorphic: true,
        },
      );

      expect(count.count).to.equal(3);
      const result = await customerRepo
        .promotions(existingCustomerId)
        .find(undefined, {
          throughOptions: {discriminator: 'promotiontype'},
          polymorphicType: ['HalfPrice', 'FreeDelivery'],
        });
      expect(toJSON(result)).to.containDeep(
        toJSON([
          {id: promo1.id, description: 'updated free delivery'},
          {id: promo2.id, description: 'updated half price'},
          {id: promo3.id, description: 'updated free delivery'},
        ]),
      );
    });

    it('patches an instance based on the filter', async () => {
      const promo1 = await customerRepo.promotions(existingCustomerId).create(
        {description: 'promo group 1'},
        {
          throughData: {
            description: 'a through model',
            promotiontype: 'FreeDelivery',
          },
          polymorphicType: 'FreeDelivery',
        },
      );
      const promo2 = await customerRepo.promotions(existingCustomerId).create(
        {description: 'promo group 2'},
        {
          throughData: {
            description: 'a through model',
            promotiontype: 'FreeDelivery',
          },
          polymorphicType: 'FreeDelivery',
        },
      );
      const promo3 = await customerRepo.promotions(existingCustomerId).create(
        {description: 'promo group 1'},
        {
          throughData: {
            description: 'a through model',
            promotiontype: 'HalfPrice',
          },
          polymorphicType: 'HalfPrice',
        },
      );
      const count = await customerRepo.promotions(existingCustomerId).patch(
        {HalfPrice: {description: 'promo group 2'}},
        {id: promo3.id},
        {
          throughOptions: {discriminator: 'promotiontype'},
          isPolymorphic: true,
        },
      );

      expect(count.count).to.equal(1);
      const result = await customerRepo
        .promotions(existingCustomerId)
        .find(undefined, {
          throughOptions: {discriminator: 'promotiontype'},
          polymorphicType: ['HalfPrice', 'FreeDelivery'],
        });
      expect(toJSON(result)).to.containDeep(
        toJSON([
          {id: promo1.id, description: 'promo group 1'},
          {id: promo2.id, description: 'promo group 2'},
          {id: promo3.id, description: 'promo group 2'},
        ]),
      );
    });

    it('throws error when query tries to change the target id', async () => {
      // a diff id for CartItem instance
      const anotherId = (await givenPersistedCustomerInstance()).id;
      await customerRepo.promotions(existingCustomerId).create(
        {description: 'promo group 1'},
        {
          throughData: {
            description: 'a through model',
            promotiontype: 'HalfPrice',
          },
          polymorphicType: 'HalfPrice',
        },
      );

      await expect(
        customerRepo
          .promotions(existingCustomerId)
          .patch({HalfPrice: {id: anotherId}}, undefined, {
            throughOptions: {discriminator: 'promotiontype'},
            isPolymorphic: true,
          }),
      ).to.be.rejectedWith(/Property "id" cannot be changed!/);
    });

    it('deletes many instances and their through models', async () => {
      await customerRepo.promotions(existingCustomerId).create(
        {description: 'promo group 1'},
        {
          throughData: {
            description: 'a through model to be deleted',
            promotiontype: 'HalfPrice',
          },
          polymorphicType: 'HalfPrice',
        },
      );
      await customerRepo.promotions(existingCustomerId).create(
        {description: 'promo group 1'},
        {
          throughData: {
            description: 'a through model to be deleted 2',
            promotiontype: 'HalfPrice',
          },
          polymorphicType: 'HalfPrice',
        },
      );
      await customerRepo.promotions(existingCustomerId).create(
        {description: 'promo group 1'},
        {
          throughData: {
            description: 'a through model to be deleted 3',
            promotiontype: 'FreeDelivery',
          },
          polymorphicType: 'FreeDelivery',
        },
      );

      let links = await customerPromotionLinkRepo.find();
      let halfPrice = await halfPriceRepo.find();
      let freeDelivery = await freeDeliveryRepo.find();
      expect(links).have.length(3);
      expect(halfPrice).have.length(2);
      expect(freeDelivery).have.length(1);

      await customerRepo.promotions(existingCustomerId).delete(undefined, {
        throughOptions: {discriminator: 'promotiontype'},
        polymorphicType: ['HalfPrice', 'FreeDelivery'],
      });
      links = await customerPromotionLinkRepo.find();
      halfPrice = await halfPriceRepo.find();
      freeDelivery = await freeDeliveryRepo.find();
      expect(halfPrice).have.length(0);
      expect(freeDelivery).have.length(0);
      expect(links).have.length(0);
    });

    it('deletes corresponding through models when the target gets deleted', async () => {
      const promotion = await customerRepo
        .promotions(existingCustomerId)
        .create(
          {description: 'promo group 1'},
          {
            throughData: {
              description: 'a through model to be deleted',
              promotiontype: 'HalfPrice',
            },
            polymorphicType: 'HalfPrice',
          },
        );
      const anotherId = (await givenPersistedCustomerInstance()).id;
      // another through model that links to the same item
      await customerPromotionLinkRepo.create({
        customerId: anotherId,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        promotion_id: promotion.id,
        promotiontype: 'HalfPrice',
      });

      let links = await customerPromotionLinkRepo.find();
      let halfPrice = await halfPriceRepo.find();
      expect(links).have.length(2);
      expect(halfPrice).have.length(1);

      await customerRepo.promotions(existingCustomerId).delete(undefined, {
        throughOptions: {discriminator: 'promotiontype'},
        polymorphicType: ['HalfPrice', 'FreeDelivery'],
      });
      links = await customerPromotionLinkRepo.find();
      halfPrice = await halfPriceRepo.find();
      expect(links).have.length(0);
      expect(halfPrice).have.length(0);
    });

    it('deletes instances based on the filter', async () => {
      await customerRepo.promotions(existingCustomerId).create(
        {description: 'promo group 1'},
        {
          throughData: {
            description: 'a through model to be deleted',
            promotiontype: 'HalfPrice',
          },
          polymorphicType: 'HalfPrice',
        },
      );
      await customerRepo.promotions(existingCustomerId).create(
        {description: 'promo group 2'},
        {
          throughData: {
            description: 'a through model to be deleted',
            promotiontype: 'FreeDelivery',
          },
          polymorphicType: 'FreeDelivery',
        },
      );

      let links = await customerPromotionLinkRepo.find();
      let freeDelivery = await freeDeliveryRepo.find();
      let halfPrice = await halfPriceRepo.find();
      expect(links).have.length(2);
      expect(freeDelivery).have.length(1);
      expect(halfPrice).have.length(1);

      await customerRepo.promotions(existingCustomerId).delete(
        {description: 'does not exist'},
        {
          throughOptions: {discriminator: 'promotiontype'},
          polymorphicType: ['HalfPrice', 'FreeDelivery'],
        },
      );
      links = await customerPromotionLinkRepo.find();
      freeDelivery = await freeDeliveryRepo.find();
      halfPrice = await halfPriceRepo.find();
      expect(links).have.length(2);
      expect(freeDelivery).have.length(1);
      expect(halfPrice).have.length(1);

      await customerRepo.promotions(existingCustomerId).delete(
        {description: 'promo group 2'},
        {
          throughOptions: {discriminator: 'promotiontype'},
          polymorphicType: ['HalfPrice', 'FreeDelivery'],
        },
      );
      links = await customerPromotionLinkRepo.find();
      freeDelivery = await freeDeliveryRepo.find();
      halfPrice = await halfPriceRepo.find();
      expect(links).have.length(1);
      expect(freeDelivery).have.length(0);
      expect(halfPrice).have.length(1);
    });

    it('links a target model to a source model', async () => {
      const freeDelivery = await freeDeliveryRepo.create({
        description: 'a free delivery promotion',
      });

      let targets = await customerRepo
        .promotions(existingCustomerId)
        .find(undefined, {
          throughOptions: {discriminator: 'promotiontype'},
          polymorphicType: ['HalfPrice', 'FreeDelivery'],
        });
      expect(targets).to.be.empty();

      await customerRepo
        .promotions(existingCustomerId)
        .link(freeDelivery.id, {throughData: {promotiontype: 'FreeDelivery'}});

      targets = await customerRepo
        .promotions(existingCustomerId)
        .find(undefined, {
          throughOptions: {discriminator: 'promotiontype'},
          polymorphicType: ['HalfPrice', 'FreeDelivery'],
        });
      expect(targets).to.deepEqual([freeDelivery]);

      const link = await customerPromotionLinkRepo.find();
      expect(toJSON(link[0])).to.containEql(
        // eslint-disable-next-line @typescript-eslint/naming-convention
        toJSON({customerId: existingCustomerId, promotion_id: freeDelivery.id}),
      );
    });

    it('unlinks a target model from a source model', async () => {
      const promotion1 = await customerRepo
        .promotions(existingCustomerId)
        .create(
          {description: 'promo group 1'},
          {
            throughData: {
              description: 'a through model to be deleted',
              promotiontype: 'HalfPrice',
            },
            polymorphicType: 'HalfPrice',
          },
        );

      let targets = await customerRepo
        .promotions(existingCustomerId)
        .find(undefined, {
          throughOptions: {discriminator: 'promotiontype'},
          polymorphicType: ['HalfPrice', 'FreeDelivery'],
        });
      expect(targets).to.deepEqual([promotion1]);

      await customerRepo.promotions(existingCustomerId).unlink(promotion1.id);

      targets = await customerRepo
        .promotions(existingCustomerId)
        .find(undefined, {
          throughOptions: {discriminator: 'promotiontype'},
          polymorphicType: ['HalfPrice', 'FreeDelivery'],
        });
      expect(targets).to.be.empty();

      const link = await customerPromotionLinkRepo.find();
      expect(link).to.be.empty();
    });

    async function givenPersistedCustomerInstance() {
      return customerRepo.create({name: 'a customer'});
    }
  });
}
