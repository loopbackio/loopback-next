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
} from '../..';
import {Address} from '../fixtures/models';
import {CustomerRepository, AddressRepository} from '../fixtures/repositories';

describe.only('hasOne relation', () => {
  // Given a Customer and Order models - see definitions at the bottom

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

    const persisted = await addressRepo.findById(address.zipcode);
    expect(persisted.toObject()).to.deepEqual(address.toObject());
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
      return await this.customerRepository.address(customerId).findOne();
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
