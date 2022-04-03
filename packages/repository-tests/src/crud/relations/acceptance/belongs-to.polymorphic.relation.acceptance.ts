// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect, toJSON} from '@loopback/testlab';
import {
  deleteAllModelsInDefaultDataSource,
  withCrudCtx,
} from '../../../helpers.repository-tests';
import {
  CrudFeatures,
  CrudRepositoryCtor,
  CrudTestContext,
  DataSourceOptions,
} from '../../../types.repository-tests';
import {
  Contact,
  ContactRepository,
  Customer,
  CustomerRepository,
  Supplier,
  SupplierRepository,
} from '../fixtures/models';
import {givenBoundCrudRepositories} from '../helpers';

export function belongsToRelationPolymorphicAcceptance(
  dataSourceOptions: DataSourceOptions,
  repositoryClass: CrudRepositoryCtor,
  features: CrudFeatures,
) {
  describe('BelongsTo relation (acceptance)', () => {
    before(deleteAllModelsInDefaultDataSource);

    let customerRepo: CustomerRepository;
    let supplierRepo: SupplierRepository;
    let contactRepo: ContactRepository;

    before(
      withCrudCtx(async function setupRepository(ctx: CrudTestContext) {
        ({customerRepo, supplierRepo, contactRepo} = givenBoundCrudRepositories(
          ctx.dataSource,
          repositoryClass,
          features,
        ));
        const models = [Customer, Supplier, Contact];
        await ctx.dataSource.automigrate(models.map(m => m.name));
      }),
    );
    beforeEach(async () => {
      await contactRepo.deleteAll();
    });

    it('can find customer from contact', async () => {
      const customer = await customerRepo.create({
        name: 'McForder customer',
      });
      const contact = await contactRepo.create({
        stakeholderId: customer.id,
        stakeholderType: 'Customer',
      });

      const result = await contactRepo.stakeholder(contact.id, 'Customer');
      // adding parentId to customer so MySQL doesn't complain about null vs
      // undefined
      expect(toJSON(result)).to.deepEqual(
        toJSON({...customer, parentId: features.emptyValue}),
      );
    });

    it('can find supplier from contact', async () => {
      const supplier = await supplierRepo.create({
        name: 'McForder supplier',
      });
      const contact = await contactRepo.create({
        stakeholderId: supplier.id,
        stakeholderType: 'Supplier',
      });

      const result = await contactRepo.stakeholder(contact.id, 'Supplier');
      // adding parentId to customer so MySQL doesn't complain about null vs
      // undefined
      expect(toJSON(result)).to.deepEqual(
        toJSON({...supplier, parentId: features.emptyValue}),
      );
    });
  });
}
