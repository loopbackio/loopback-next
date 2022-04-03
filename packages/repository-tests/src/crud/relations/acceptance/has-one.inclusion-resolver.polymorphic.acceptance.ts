// Copyright IBM Corp. 2019,2020. All Rights Reserved.
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
  CardInfoRepository,
  Cash,
  CashRepository,
  CreditCard,
  CreditCardRepository,
  Customer,
  CustomerRepository,
} from '../fixtures/models';
import {givenBoundCrudRepositories} from '../helpers';

export function hasOneInclusionResolverPolymorphicAcceptance(
  dataSourceOptions: DataSourceOptions,
  repositoryClass: CrudRepositoryCtor,
  features: CrudFeatures,
) {
  skipIf<[(this: Suite) => void], void>(
    !features.supportsInclusionResolvers,
    describe,
    'HasOne inclusion resolvers - polymorphic - acceptance',
    suite,
  );
  function suite() {
    before(deleteAllModelsInDefaultDataSource);
    let customerRepo: CustomerRepository;
    let creditCardRepo: CreditCardRepository;
    let cashRepo: CashRepository;
    let cardInfoRepo: CardInfoRepository;

    before(
      withCrudCtx(async function setupRepository(ctx: CrudTestContext) {
        // this helper should create the inclusion resolvers and also
        // register inclusion resolvers for us
        ({customerRepo, creditCardRepo, cashRepo, cardInfoRepo} =
          givenBoundCrudRepositories(
            ctx.dataSource,
            repositoryClass,
            features,
          ));
        expect(customerRepo.paymentMethod.inclusionResolver).to.be.Function();

        await ctx.dataSource.automigrate([
          Customer.name,
          CreditCard.name,
          Cash.name,
        ]);
      }),
    );

    beforeEach(async () => {
      await customerRepo.deleteAll();
      await creditCardRepo.deleteAll();
      await cashRepo.deleteAll();
      await cardInfoRepo.deleteAll();
    });

    it('throws an error if it tries to query nonexistent relation names', async () => {
      const customer = await customerRepo.create({
        name: 'customer',
        paymentMethodType: 'CreditCard',
      });
      await creditCardRepo.create({
        customerId: customer.id,
      });
      await expect(customerRepo.find({include: ['home']})).to.be.rejectedWith(
        `Invalid "filter.include" entries: "home"`,
      );
    });

    it('returns single model instance including single related instance', async () => {
      const thor = await customerRepo.create({
        name: 'Thor',
        paymentMethodType: 'CreditCard',
      });
      const thorCreditCard = await creditCardRepo.create({
        customerId: thor.id,
      });
      const result = await customerRepo.find({
        include: ['paymentMethod'],
      });

      const expected = {
        ...thor,
        parentId: features.emptyValue,
        paymentMethod: thorCreditCard,
      };
      expect(toJSON(result)).to.deepEqual([toJSON(expected)]);
    });

    it('returns multiple model instances including related instances', async () => {
      const thor = await customerRepo.create({
        name: 'Thor',
        paymentMethodType: 'Cash',
      });
      const odin = await customerRepo.create({
        name: 'Odin',
        paymentMethodType: 'CreditCard',
      });
      const thorCash = await cashRepo.create({
        customerId: thor.id,
      });
      const odinCreditCard = await creditCardRepo.create({
        customerId: odin.id,
      });

      const result = await customerRepo.find({
        include: ['paymentMethod'],
      });

      const expected = [
        {
          ...thor,
          parentId: features.emptyValue,
          paymentMethod: thorCash,
        },
        {
          ...odin,
          parentId: features.emptyValue,
          paymentMethod: odinCreditCard,
        },
      ];
      expect(toJSON(result)).to.deepEqual(toJSON(expected));
    });

    it('returns a specified instance including its related model instance', async () => {
      const thor = await customerRepo.create({
        name: 'Thor',
        paymentMethodType: 'Cash',
      });
      const odin = await customerRepo.create({
        name: 'Odin',
        paymentMethodType: 'CreditCard',
      });
      const bella = await customerRepo.create({
        name: 'Bella',
        paymentMethodType: 'CreditCard',
      });
      await cashRepo.create({
        customerId: thor.id,
      });
      await creditCardRepo.create({
        customerId: odin.id,
      });
      const bellaPaymentMethod = await creditCardRepo.create({
        customerId: bella.id,
      });
      const bellaCardInfo = await creditCardRepo
        .cardInfo(bellaPaymentMethod.id)
        .create({cardHolder: 'bella!'});
      bellaPaymentMethod.cardInfo = bellaCardInfo;
      const result = await customerRepo.findById(bella.id, {
        include: [
          {
            relation: 'paymentMethod',
            scope: {
              include: [
                {
                  relation: 'cardInfo',
                  targetType: 'CreditCard',
                },
              ],
            },
          },
        ],
      });

      const expected = {
        ...bella,
        parentId: features.emptyValue,
        paymentMethod: bellaPaymentMethod,
      };
      expect(toJSON(result)).to.deepEqual(toJSON(expected));
    });

    it('throws error if the target repository does not have the registered resolver', async () => {
      const customer = await customerRepo.create({
        name: 'customer',
        paymentMethodType: 'CreditCard',
      });
      await creditCardRepo.create({
        customerId: customer.id,
      });
      // unregister the resolver
      customerRepo.inclusionResolvers.delete('paymentMethod');

      await expect(
        customerRepo.find({include: ['paymentMethod']}),
      ).to.be.rejectedWith(`Invalid "filter.include" entries: "paymentMethod"`);
    });
  }
}
