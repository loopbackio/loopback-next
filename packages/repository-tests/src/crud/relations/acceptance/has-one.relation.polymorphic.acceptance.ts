// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {DataObject, EntityNotFoundError} from '@loopback/repository';
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
  Cash,
  CashRepository,
  CreditCard,
  CreditCardRepository,
  Customer,
  CustomerRepository,
  PaymentMethod,
} from '../fixtures/models';
import {givenBoundCrudRepositories} from '../helpers';

export function hasOneRelationPolymorphicAcceptance(
  dataSourceOptions: DataSourceOptions,
  repositoryClass: CrudRepositoryCtor,
  features: CrudFeatures,
) {
  describe('hasOne relation polymorphic (acceptance)', () => {
    let customerRepo: CustomerRepository;
    let creditCardRepo: CreditCardRepository;
    let cashRepo: CashRepository;
    let existingCustomerId: MixedIdType;

    before(deleteAllModelsInDefaultDataSource);

    before(
      withCrudCtx(async function setupRepository(ctx: CrudTestContext) {
        ({customerRepo, creditCardRepo, cashRepo} = givenBoundCrudRepositories(
          ctx.dataSource,
          repositoryClass,
          features,
        ));
        const models = [Customer, CreditCard, Cash];
        await ctx.dataSource.automigrate(models.map(m => m.name));
      }),
    );

    beforeEach(async () => {
      await customerRepo.deleteAll();
      await creditCardRepo.deleteAll();
      await cashRepo.deleteAll();
      existingCustomerId = (await givenPersistedCustomerInstance()).id;
    });

    it('can create an instance of the related model', async () => {
      const address = await createCustomerPaymentMethod(
        existingCustomerId,
        {},
        'CreditCard',
      );
      expect(toJSON(address)).to.containDeep(
        toJSON({
          customerId: existingCustomerId,
        }),
      );

      const persisted = await creditCardRepo.findById(address.id);
      expect(toJSON(persisted)).to.deepEqual(
        toJSON({
          ...address,
          zipcode: features.emptyValue,
          city: features.emptyValue,
          province: features.emptyValue,
        }),
      );
    });

    // We do not enforce referential integrity at the moment. It is up to
    // our users to set up unique constraint(s) between related models at the
    // database level
    it.skip('refuses to create related model instance twice', async () => {
      const creditCard = await createCustomerPaymentMethod(
        existingCustomerId,
        {},
        'CreditCard',
      );
      await expect(
        createCustomerPaymentMethod(existingCustomerId, {}, 'Cash'),
      ).to.be.rejectedWith(/Duplicate entry for PaymentMethod.customerId/);
      expect(creditCard.toObject()).to.containDeep({
        customerId: existingCustomerId,
      });

      const persisted = await creditCardRepo.findById(creditCard.id);
      expect(persisted.toObject()).to.deepEqual(creditCard.toObject());
    });

    it('can find instance of the related model', async () => {
      const creditCard = await createCustomerPaymentMethod(
        existingCustomerId,
        {},
        'CreditCard',
      );
      const foundCreditCard = await findCustomerPaymentMethod(
        existingCustomerId,
        'CreditCard',
      );
      expect(toJSON(foundCreditCard)).to.containEql(toJSON(creditCard));
      expect(toJSON(foundCreditCard)).to.deepEqual(
        toJSON({
          ...creditCard,
        }),
      );

      const persisted = await creditCardRepo.find({
        where: {customerId: existingCustomerId},
      });
      expect(persisted[0]).to.deepEqual(foundCreditCard);
    });

    it('reports EntityNotFound error when related model is deleted', async () => {
      const paymentMethod = await createCustomerPaymentMethod(
        existingCustomerId,
        {},
        'CreditCard',
      );
      await creditCardRepo.deleteById(paymentMethod.id);

      await expect(
        findCustomerPaymentMethod(existingCustomerId, 'CreditCard'),
      ).to.be.rejectedWith(EntityNotFoundError);
    });

    it('can PATCH hasOne instances', async () => {
      const paymentMethod = await createCustomerPaymentMethod(
        existingCustomerId,
        {},
        'CreditCard',
      );

      const patchObject = {cardNumber: 46458921} as DataObject<PaymentMethod>;
      const arePatched = await patchCustomerPaymentMethod(
        existingCustomerId,
        {CreditCard: patchObject as DataObject<CreditCard>} as {
          [polymorphicType: string]: DataObject<CreditCard>;
        },
        true,
      );

      expect(arePatched).to.deepEqual({count: 1});
      const patchedData = await creditCardRepo.findById(paymentMethod.id);

      expect(toJSON(patchedData)).to.deepEqual(
        toJSON({
          id: paymentMethod.id,
          customerId: existingCustomerId,
          cardNumber: 46458921,
        }),
      );
    });

    it('patches the related instance only', async () => {
      const bob = await customerRepo.create({name: 'Bob'});
      await customerRepo
        .paymentMethod(bob.id)
        .create({cardNumber: 12345} as DataObject<PaymentMethod>, {
          polymorphicType: 'CreditCard',
        });

      const alice = await customerRepo.create({name: 'Alice'});
      await customerRepo
        .paymentMethod(alice.id)
        .create({cardNumber: 67890} as DataObject<PaymentMethod>, {
          polymorphicType: 'CreditCard',
        });

      const result = await patchCustomerPaymentMethod(
        alice.id,
        {
          CreditCard: {
            cardNumber: 7894512,
          } as DataObject<CreditCard>,
        } as {[polymorphicType: string]: DataObject<CreditCard>},
        true,
      );

      expect(result).to.deepEqual({count: 1});

      const foundBob = await customerRepo
        .paymentMethod(bob.id)
        .get(undefined, {polymorphicType: 'CreditCard'});
      expect(toJSON(foundBob)).to.containDeep({cardNumber: 12345});

      const foundAlice = await customerRepo
        .paymentMethod(bob.id)
        .get(undefined, {polymorphicType: 'CreditCard'});
      expect(toJSON(foundAlice)).to.containDeep({cardNumber: 12345});
    });

    it('throws an error when PATCH tries to change the foreignKey', async () => {
      const anotherId = (await givenPersistedCustomerInstance()).id;
      await expect(
        patchCustomerPaymentMethod(
          existingCustomerId,
          {
            CreditCard: {
              customerId: anotherId,
            } as DataObject<CreditCard>,
          } as {[polymorphicType: string]: DataObject<CreditCard>},
          true,
        ),
      ).to.be.rejectedWith(/Property "customerId" cannot be changed!/);
    });

    it('can DELETE hasOne relation instances', async () => {
      await createCustomerPaymentMethod(existingCustomerId, {}, 'CreditCard');

      const areDeleted = await deleteCustomerPaymentMethod(
        existingCustomerId,
        'CreditCard',
      );
      expect(areDeleted).to.deepEqual({count: 1});

      await expect(
        findCustomerPaymentMethod(existingCustomerId, 'CreditCard'),
      ).to.be.rejectedWith(EntityNotFoundError);
    });

    it('deletes the related model instance only', async () => {
      const bob = await customerRepo.create({name: 'Bob'});
      await customerRepo
        .paymentMethod(bob.id)
        .create({}, {polymorphicType: 'CreditCard'});

      const alice = await customerRepo.create({name: 'Alice'});
      await customerRepo
        .paymentMethod(alice.id)
        .create({}, {polymorphicType: 'Cash'});

      const brown = await customerRepo.create({name: 'Brown'});
      await customerRepo
        .paymentMethod(brown.id)
        .create({}, {polymorphicType: 'Cash'});

      const result = await deleteCustomerPaymentMethod(alice.id, 'Cash');

      expect(result).to.deepEqual({count: 1});

      const found = await cashRepo.find();
      expect(found).to.have.length(1);
    });

    it('deletes the related model instance with wrong type', async () => {
      const bob = await customerRepo.create({name: 'Bob'});
      await customerRepo
        .paymentMethod(bob.id)
        .create({}, {polymorphicType: 'CreditCard'});

      const alice = await customerRepo.create({name: 'Alice'});
      await customerRepo
        .paymentMethod(alice.id)
        .create({}, {polymorphicType: 'Cash'});

      const brown = await customerRepo.create({name: 'Brown'});
      await customerRepo
        .paymentMethod(brown.id)
        .create({}, {polymorphicType: 'Cash'});

      const result = await deleteCustomerPaymentMethod(alice.id, 'CreditCard');

      expect(result).to.deepEqual({count: 0});

      const found = await cashRepo.find();
      expect(found).to.have.length(2);
    });

    /*---------------- HELPERS -----------------*/

    async function createCustomerPaymentMethod(
      customerId: MixedIdType,
      paymentMethodData: DataObject<PaymentMethod>,
      polymorphicTypeName: string,
    ): Promise<PaymentMethod> {
      return customerRepo
        .paymentMethod(customerId)
        .create(paymentMethodData, {polymorphicType: polymorphicTypeName});
    }

    async function findCustomerPaymentMethod(
      customerId: MixedIdType,
      polymorphicType: string,
    ) {
      return customerRepo
        .paymentMethod(customerId)
        .get(undefined, {polymorphicType: polymorphicType});
    }

    async function patchCustomerPaymentMethod(
      customerId: MixedIdType,
      paymentMethodData: DataObject<PaymentMethod>,
      isMultipleTypes: boolean,
    ) {
      return customerRepo
        .paymentMethod(customerId)
        .patch(paymentMethodData, {isPolymorphic: isMultipleTypes});
    }

    async function deleteCustomerPaymentMethod(
      customerId: MixedIdType,
      polymorphicType: string,
    ) {
      return customerRepo
        .paymentMethod(customerId)
        .delete({polymorphicType: polymorphicType});
    }

    async function givenPersistedCustomerInstance() {
      return customerRepo.create({name: 'a customer'});
    }
  });
}
