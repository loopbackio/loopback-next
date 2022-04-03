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
  Contact,
  ContactRepository,
  Customer,
  CustomerRepository,
  Supplier,
  SupplierRepository,
} from '../fixtures/models';
import {givenBoundCrudRepositories} from '../helpers';

export function belongsToInclusionResolverPolymorphicAcceptance(
  dataSourceOptions: DataSourceOptions,
  repositoryClass: CrudRepositoryCtor,
  features: CrudFeatures,
) {
  skipIf<[(this: Suite) => void], void>(
    !features.supportsInclusionResolvers,
    describe,
    'BelongsTo inclusion resolvers - polymorphic - acceptance',
    suite,
  );
  function suite() {
    before(deleteAllModelsInDefaultDataSource);
    let customerRepo: CustomerRepository;
    let supplierRepo: SupplierRepository;
    let contactRepo: ContactRepository;

    before(
      withCrudCtx(async function setupRepository(ctx: CrudTestContext) {
        // this helper should create the inclusion resolvers and also
        // register inclusion resolvers for us
        ({customerRepo, supplierRepo, contactRepo} = givenBoundCrudRepositories(
          ctx.dataSource,
          repositoryClass,
          features,
        ));
        expect(customerRepo.contact.inclusionResolver).to.be.Function();
        expect(supplierRepo.contact.inclusionResolver).to.be.Function();
        expect(contactRepo.stakeholder.inclusionResolver).to.be.Function();

        await ctx.dataSource.automigrate([
          Customer.name,
          Supplier.name,
          Contact.name,
        ]);
      }),
    );

    beforeEach(async () => {
      await customerRepo.deleteAll();
      await supplierRepo.deleteAll();
      await contactRepo.deleteAll();
    });

    it('throws an error if it tries to query nonexistent relation names', async () => {
      const customer = await customerRepo.create({name: 'customer'});
      await contactRepo.create({
        stakeholderId: customer.id,
      });
      await expect(
        contactRepo.find({include: ['shipment']}),
      ).to.be.rejectedWith(`Invalid "filter.include" entries: "shipment"`);
    });

    it('returns single model instance including single related instance', async () => {
      const thor = await customerRepo.create({name: 'Thor'});
      const contact = await contactRepo.create({
        stakeholderId: thor.id,
      });
      const result = await contactRepo.find({
        include: ['stakeholder'],
      });

      const expected = {
        ...contact,
        isShipped: features.emptyValue,
        shipmentInfo: features.emptyValue,
        stakeholder: {
          ...thor,
          parentId: features.emptyValue,
        },
      };
      expect(toJSON(result)).to.deepEqual([toJSON(expected)]);
    });

    it('returns multiple model instances including related instances', async () => {
      const thor = await customerRepo.create({
        name: 'Thor',
        paymentMethodType: 'CreditCard',
      });
      const odin = await supplierRepo.create({name: 'Odin'});
      const thorContact = await contactRepo.create({
        stakeholderId: thor.id,
      });
      const odinContact = await contactRepo.create({
        stakeholderId: odin.id,
        stakeholderType: 'Supplier',
      });

      const result = await contactRepo.find({
        include: ['stakeholder'],
      });

      const expected = [
        {
          ...thorContact,
          isShipped: features.emptyValue,
          shipmentInfo: features.emptyValue,
          stakeholder: {
            ...thor,
            parentId: features.emptyValue,
          },
        },
        {
          ...odinContact,
          isShipped: features.emptyValue,
          shipmentInfo: features.emptyValue,
          stakeholder: {
            ...odin,
            parentId: features.emptyValue,
          },
        },
      ];
      expect(toJSON(result)).to.deepEqual(toJSON(expected));
    });

    it('returns a specified instance including its related model instances', async () => {
      const thor = await customerRepo.create({name: 'Thor'});
      const odin = await supplierRepo.create({name: 'Odin'});
      const bella = await supplierRepo.create({name: 'Bella'});
      await contactRepo.create({
        stakeholderId: thor.id,
      });
      await contactRepo.create({
        stakeholderId: bella.id,
        stakeholderType: 'Supplier',
      });
      const odinContact = await contactRepo.create({
        stakeholderId: odin.id,
        stakeholderType: 'Supplier',
      });

      const result = await contactRepo.findById(odinContact.id, {
        include: ['stakeholder'],
      });
      const expected = {
        ...odinContact,
        isShipped: features.emptyValue,
        shipmentInfo: features.emptyValue,
        stakeholder: {
          ...odin,
          parentId: features.emptyValue,
        },
      };
      expect(toJSON(result)).to.deepEqual(toJSON(expected));
    });

    it('queries entities with null foreign key', async () => {
      const customer = await customerRepo.create({
        name: 'Thor',
      });

      const contact1 = await contactRepo.create({
        stakeholderId: customer.id,
      });

      const contact2 = await contactRepo.create({});

      const expected = [
        {
          ...contact1,
          isShipped: features.emptyValue,
          shipmentInfo: features.emptyValue,
          stakeholder: {
            ...customer,
            parentId: features.emptyValue,
          },
        },
        {
          ...contact2,
          stakeholderId: features.emptyValue,
          isShipped: features.emptyValue,
          shipmentInfo: features.emptyValue,
        },
      ];

      const result = await contactRepo.find({include: ['stakeholder']});
      expect(toJSON(result)).to.deepEqual(toJSON(expected));
    });

    it('throws error if the target repository does not have the registered resolver', async () => {
      const customer = await customerRepo.create({name: 'customer'});
      await contactRepo.create({
        stakeholderId: customer.id,
      });
      // unregister the resolver
      contactRepo.inclusionResolvers.delete('stakeholder');

      await expect(
        contactRepo.find({include: ['stakeholder']}),
      ).to.be.rejectedWith(`Invalid "filter.include" entries: "stakeholder"`);
    });
  }
}
