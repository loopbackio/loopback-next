// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application} from '@loopback/core';
import {expect, toJSON} from '@loopback/testlab';
import {
  ApplicationWithRepositories,
  EntityNotFoundError,
  Filter,
  juggler,
  repository,
  RepositoryMixin,
} from '../..';
import {Address} from '../fixtures/models';
import {AddressRepository, CustomerRepository} from '../fixtures/repositories';

describe('hasOne relation', () => {
  // Given a Customer and Address models - see definitions at the bottom

  let app: ApplicationWithRepositories;
  let controller: CustomerController;
  let customerRepo: CustomerRepository;
  let addressRepo: AddressRepository;
  let existingCustomerId: number;

  before(givenApplicationWithMemoryDB);
  before(givenBoundCrudRepositoriesForCustomerAndAddress);
  before(givenCustomerController);

  beforeEach(async () => {
    await addressRepo.deleteAll();
    existingCustomerId = (await givenPersistedCustomerInstance()).id;
  });

  it('can create an instance of the related model', async () => {
    const address = await controller.createCustomerAddress(existingCustomerId, {
      street: '123 test avenue',
    });
    expect(address.toObject()).to.containDeep({
      customerId: existingCustomerId,
      street: '123 test avenue',
    });

    const persisted = await addressRepo.findById(address.zipcode);
    expect(persisted.toObject()).to.deepEqual(address.toObject());
  });

  // We do not enforce referential integrity at the moment. It is up to
  // our users to set up unique constraint(s) between related models at the
  // database level
  it.skip('refuses to create related model instance twice', async () => {
    const address = await controller.createCustomerAddress(existingCustomerId, {
      street: '123 test avenue',
    });
    await expect(
      controller.createCustomerAddress(existingCustomerId, {
        street: '456 test street',
      }),
    ).to.be.rejectedWith(/Duplicate entry for Address.customerId/);
    expect(address.toObject()).to.containDeep({
      customerId: existingCustomerId,
      street: '123 test avenue',
    });

    const persisted = await addressRepo.findById(address.zipcode);
    expect(persisted.toObject()).to.deepEqual(address.toObject());
  });

  it('can find instance of the related model', async () => {
    const address = await controller.createCustomerAddress(existingCustomerId, {
      street: '123 test avenue',
    });
    const foundAddress = await controller.findCustomerAddress(
      existingCustomerId,
    );
    expect(foundAddress).to.containEql(address);
    expect(toJSON(foundAddress)).to.deepEqual(toJSON(address));

    const persisted = await addressRepo.find({
      where: {customerId: existingCustomerId},
    });
    expect(persisted[0]).to.deepEqual(foundAddress);
  });

  // FIXME(b-admike): make sure the test fails with compiler error
  it.skip('ignores where filter to find related model instance', async () => {
    const foundAddress = await controller.findCustomerAddressWithFilter(
      existingCustomerId,
      // the compiler should complain that the where field is
      // not accepted in the filter object for the get() method
      // if the following line is uncommented
      {
        where: {street: '456 test road'},
      },
    );

    const persisted = await addressRepo.find({
      where: {customerId: existingCustomerId},
    });
    // TODO: make sure this test fails when where condition is supplied
    // compiler should have errored out (?)
    expect(persisted[0]).to.deepEqual(foundAddress);
  });

  it('reports EntityNotFound error when related model is deleted', async () => {
    const address = await controller.createCustomerAddress(existingCustomerId, {
      street: '123 test avenue',
    });
    await addressRepo.deleteById(address.zipcode);

    await expect(
      controller.findCustomerAddress(existingCustomerId),
    ).to.be.rejectedWith(EntityNotFoundError);
  });

  it('can PATCH hasOne instances', async () => {
    const address = await controller.createCustomerAddress(existingCustomerId, {
      street: '1 Amedee Bonnet',
      zipcode: '69740',
      city: 'Genas',
      province: 'Rhone',
    });

    const patchObject = {city: 'Lyon-Genas'};
    const arePatched = await controller.patchCustomerAddress(
      existingCustomerId,
      patchObject,
    );

    expect(arePatched).to.deepEqual({count: 1});
    const patchedData = await addressRepo.findById(address.zipcode);
    expect(toJSON(patchedData)).to.deepEqual({
      customerId: existingCustomerId,
      street: '1 Amedee Bonnet',
      zipcode: '69740',
      city: 'Lyon-Genas',
      province: 'Rhone',
    });
  });

  it('patches the related instance only', async () => {
    const bob = await customerRepo.create({name: 'Bob'});
    await customerRepo.address(bob.id).create({city: 'Paris'});

    const alice = await customerRepo.create({name: 'Alice'});
    await customerRepo.address(alice.id).create({city: 'London'});

    const result = await controller.patchCustomerAddress(alice.id, {
      city: 'New York',
    });

    expect(result).to.deepEqual({count: 1});

    const found = await customerRepo.address(bob.id).get();
    expect(toJSON(found)).to.containDeep({city: 'Paris'});
  });

  it('throws an error when PATCH tries to change the foreignKey', async () => {
    await expect(
      controller.patchCustomerAddress(existingCustomerId, {
        customerId: existingCustomerId + 1,
      }),
    ).to.be.rejectedWith(/Property "customerId" cannot be changed!/);
  });

  it('can DELETE hasOne relation instances', async () => {
    await controller.createCustomerAddress(existingCustomerId, {
      street: '1 Amedee Bonnet',
      zipcode: '69740',
      city: 'Genas',
      province: 'Rhone',
    });

    const areDeleted = await controller.deleteCustomerAddress(
      existingCustomerId,
    );
    expect(areDeleted).to.deepEqual({count: 1});

    await expect(
      controller.findCustomerAddress(existingCustomerId),
    ).to.be.rejectedWith(EntityNotFoundError);
  });

  it('deletes the related model instance only', async () => {
    const bob = await customerRepo.create({name: 'Bob'});
    await customerRepo.address(bob.id).create({city: 'Paris'});

    const alice = await customerRepo.create({name: 'Alice'});
    await customerRepo.address(alice.id).create({city: 'London'});

    const result = await controller.deleteCustomerAddress(alice.id);

    expect(result).to.deepEqual({count: 1});

    const found = await addressRepo.find();
    expect(found).to.have.length(1);
  });

  /*---------------- HELPERS -----------------*/

  class CustomerController {
    constructor(
      @repository(CustomerRepository)
      protected customerRepository: CustomerRepository,
    ) {}

    async createCustomerAddress(
      customerId: number,
      addressData: Partial<Address>,
    ): Promise<Address> {
      return await this.customerRepository
        .address(customerId)
        .create(addressData);
    }

    async findCustomerAddress(customerId: number) {
      return await this.customerRepository.address(customerId).get();
    }

    async findCustomerAddressWithFilter(
      customerId: number,
      filter: Filter<Address>,
    ) {
      return await this.customerRepository.address(customerId).get(filter);
    }
    async patchCustomerAddress(
      customerId: number,
      addressData: Partial<Address>,
    ) {
      return await this.customerRepository
        .address(customerId)
        .patch(addressData);
    }

    async deleteCustomerAddress(customerId: number) {
      return await this.customerRepository.address(customerId).delete();
    }
  }

  function givenApplicationWithMemoryDB() {
    class TestApp extends RepositoryMixin(Application) {}
    app = new TestApp();
    app.dataSource(new juggler.DataSource({name: 'db', connector: 'memory'}));
  }

  async function givenBoundCrudRepositoriesForCustomerAndAddress() {
    app.repository(CustomerRepository);
    app.repository(AddressRepository);
    customerRepo = await app.getRepository(CustomerRepository);
    addressRepo = await app.getRepository(AddressRepository);
  }

  async function givenCustomerController() {
    app.controller(CustomerController);
    controller = await app.get<CustomerController>(
      'controllers.CustomerController',
    );
  }

  async function givenPersistedCustomerInstance() {
    return customerRepo.create({name: 'a customer'});
  }
});
