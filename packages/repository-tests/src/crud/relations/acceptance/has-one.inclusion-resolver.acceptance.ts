// Copyright IBM Corp. 2019. All Rights Reserved.
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
  Address,
  AddressRepository,
  Customer,
  CustomerRepository,
} from '../fixtures/models';
import {givenBoundCrudRepositories} from '../helpers';

export function hasOneInclusionResolverAcceptance(
  dataSourceOptions: DataSourceOptions,
  repositoryClass: CrudRepositoryCtor,
  features: CrudFeatures,
) {
  skipIf<[(this: Suite) => void], void>(
    !features.supportsInclusionResolvers,
    describe,
    'HasOne inclusion resolvers - acceptance',
    suite,
  );
  function suite() {
    before(deleteAllModelsInDefaultDataSource);
    let customerRepo: CustomerRepository;
    let addressRepo: AddressRepository;

    before(
      withCrudCtx(async function setupRepository(ctx: CrudTestContext) {
        // this helper should create the inclusion resolvers and also
        // register inclusion resolvers for us
        ({customerRepo, addressRepo} = givenBoundCrudRepositories(
          ctx.dataSource,
          repositoryClass,
          features,
        ));
        expect(customerRepo.address.inclusionResolver).to.be.Function();

        await ctx.dataSource.automigrate([Customer.name, Address.name]);
      }),
    );

    beforeEach(async () => {
      await customerRepo.deleteAll();
      await addressRepo.deleteAll();
    });

    it('throws an error if it tries to query nonexistent relation names', async () => {
      const customer = await customerRepo.create({name: 'customer'});
      await addressRepo.create({
        street: 'home of Thor Rd.',
        city: 'Thrudheim',
        province: 'Asgard',
        zipcode: '8200',
        customerId: customer.id,
      });
      await expect(
        customerRepo.find({include: [{relation: 'home'}]}),
      ).to.be.rejectedWith(
        `Invalid "filter.include" entries: {"relation":"home"}`,
      );
    });

    it('returns single model instance including single related instance', async () => {
      const thor = await customerRepo.create({name: 'Thor'});
      const thorAddress = await addressRepo.create({
        street: 'home of Thor Rd.',
        city: 'Thrudheim',
        province: 'Asgard',
        zipcode: '8200',
        customerId: thor.id,
      });
      const result = await customerRepo.find({
        include: [{relation: 'address'}],
      });

      const expected = {
        ...thor,
        parentId: features.emptyValue,
        address: thorAddress,
      };
      expect(toJSON(result)).to.deepEqual([toJSON(expected)]);
    });

    it('returns multiple model instances including related instances', async () => {
      const thor = await customerRepo.create({name: 'Thor'});
      const odin = await customerRepo.create({name: 'Odin'});
      const thorAddress = await addressRepo.create({
        street: 'home of Thor Rd.',
        city: 'Thrudheim',
        province: 'Asgard',
        zipcode: '999',
        customerId: thor.id,
      });
      const odinAddress = await addressRepo.create({
        street: 'home of Odin Rd.',
        city: 'Valhalla',
        province: 'Asgard',
        zipcode: '000',
        customerId: odin.id,
      });

      const result = await customerRepo.find({
        include: [{relation: 'address'}],
      });

      const expected = [
        {
          ...thor,
          parentId: features.emptyValue,
          address: thorAddress,
        },
        {
          ...odin,
          parentId: features.emptyValue,
          address: odinAddress,
        },
      ];
      expect(toJSON(result)).to.deepEqual(toJSON(expected));
    });

    it('returns a specified instance including its related model instance', async () => {
      const thor = await customerRepo.create({name: 'Thor'});
      const odin = await customerRepo.create({name: 'Odin'});
      await addressRepo.create({
        street: 'home of Thor Rd.',
        city: 'Thrudheim',
        province: 'Asgard',
        zipcode: '999',
        customerId: thor.id,
      });
      const odinAddress = await addressRepo.create({
        street: 'home of Odin Rd.',
        city: 'Valhalla',
        province: 'Asgard',
        zipcode: '000',
        customerId: odin.id,
      });

      const result = await customerRepo.findById(odin.id, {
        include: [{relation: 'address'}],
      });
      const expected = {
        ...odin,
        parentId: features.emptyValue,
        address: odinAddress,
      };
      expect(toJSON(result)).to.deepEqual(toJSON(expected));
    });

    // scope field for inclusion is not supported yet
    it('throws error if the inclusion query contains a non-empty scope', async () => {
      const customer = await customerRepo.create({name: 'customer'});
      await addressRepo.create({
        street: 'home of Thor Rd.',
        city: 'Thrudheim',
        province: 'Asgard',
        zipcode: '8200',
        customerId: customer.id,
      });
      await expect(
        customerRepo.find({
          include: [{relation: 'address', scope: {limit: 1}}],
        }),
      ).to.be.rejectedWith(`scope is not supported`);
    });

    it('throws error if the target repository does not have the registered resolver', async () => {
      const customer = await customerRepo.create({name: 'customer'});
      await addressRepo.create({
        street: 'home of Thor Rd.',
        city: 'Thrudheim',
        province: 'Asgard',
        zipcode: '8200',
        customerId: customer.id,
      });
      // unregister the resolver
      customerRepo.inclusionResolvers.delete('address');

      await expect(
        customerRepo.find({include: [{relation: 'address'}]}),
      ).to.be.rejectedWith(
        `Invalid "filter.include" entries: {"relation":"address"}`,
      );
    });
  }
}
