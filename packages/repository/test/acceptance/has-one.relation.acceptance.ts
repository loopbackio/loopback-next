// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application} from '@loopback/core';
import {expect} from '@loopback/testlab';
import * as _ from 'lodash';
import {
  ApplicationWithRepositories,
  juggler,
  repository,
  RepositoryMixin,
  Filter,
} from '../..';
import {Address} from '../fixtures/models';
import {CustomerRepository, AddressRepository} from '../fixtures/repositories';
import {Where} from '../..';

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
  });

  beforeEach(async () => {
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

    const persisted = await addressRepo.findById(address.customerId);
    expect(persisted.toObject()).to.deepEqual(address.toObject());
  });

  it("doesn't allow to create related model instance twice", async () => {
    const address = await controller.createCustomerAddress(existingCustomerId, {
      street: '123 test avenue',
    });
    expect(
      controller.createCustomerAddress(existingCustomerId, {
        street: '456 test street',
        customerId: 44012,
      }),
    ).to.be.rejectedWith(/Property "customerId" cannot be changed!/);
    expect(address.toObject()).to.containDeep({
      customerId: existingCustomerId,
      street: '123 test avenue',
    });

    const persisted = await addressRepo.findById(address.customerId);
    expect(persisted.toObject()).to.deepEqual(address.toObject());
    expect(addressRepo.findById(44012)).to.be.rejectedWith(/Entity not found/);
  });

  it('can find instance of the related model', async () => {
    const address = await controller.createCustomerAddress(existingCustomerId, {
      street: '123 test avenue',
    });
    const notMyAddress = await controller.createCustomerAddress(
      existingCustomerId + 1,
      {
        street: '456 test road',
      },
    );
    const foundAddress = await controller.findCustomerAddress(
      existingCustomerId,
    );
    expect(foundAddress).to.containEql(address);
    expect(foundAddress).to.not.containEql(notMyAddress);

    const persisted = await addressRepo.find({
      where: {customerId: existingCustomerId},
    });
    expect(persisted[0]).to.deepEqual(foundAddress);
  });

  it('does not allow where filter to find related model instance', async () => {
    const address = await controller.createCustomerAddress(existingCustomerId, {
      street: '123 test avenue',
    });

    const foundAddress = await controller.findCustomerAddressWithFilter(
      existingCustomerId,
      {where: {street: '123 test avenue'}},
    );
    // TODO: make sure this test fails when where condition is supplied
    // compiler should have errored out (?)
    expect(foundAddress).to.containEql(address);

    const persisted = await addressRepo.find({
      where: {customerId: existingCustomerId},
    });
    expect(persisted[0]).to.deepEqual(foundAddress);
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
