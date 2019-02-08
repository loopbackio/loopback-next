// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as _ from 'lodash';
import {Application} from '@loopback/core';
import {expect} from '@loopback/testlab';
import {
  ApplicationWithRepositories,
  juggler,
  repository,
  RepositoryMixin,
} from '@loopback/repository';
import {
  Order,
  Seller,
} from '@loopback/repository/src/__tests__/fixtures/models';
import {
  CustomerRepository,
  OrderRepository,
  SellerRepository,
} from '@loopback/repository/src/__tests__/fixtures/repositories';

describe('HasManyThrough relation', () => {
  // Given a Customer and Seller models - see definitions at the bottom

  let app: ApplicationWithRepositories;
  let controller: CustomerController;
  let customerRepo: CustomerRepository;
  let orderRepo: OrderRepository;
  let sellerRepo: SellerRepository;
  let existingCustomerId: number;

  before(givenApplicationWithMemoryDB);
  before(givenBoundCrudRepositoriesForCustomerAndSeller);
  before(givenCustomerController);

  beforeEach(async () => {
    await sellerRepo.deleteAll();
  });

  beforeEach(async () => {
    existingCustomerId = (await givenPersistedCustomerInstance()).id;
  });

  it('can create an instance of the related model', async () => {
    const seller = await controller.createCustomerSellers(
      existingCustomerId,
      {
        name: 'Jam Risser',
      },
      {description: 'some order'},
    );
    expect(seller.toObject()).to.containDeep({
      name: 'Jam Risser',
    });

    const persisted = await sellerRepo.findById(seller.id);
    expect(persisted.toObject()).to.deepEqual(seller.toObject());
  });

  it('can find instances of the related model', async () => {
    const seller = await controller.createCustomerSellers(
      existingCustomerId,
      {
        name: 'Jam Risser',
      },
      {description: 'some order'},
    );
    const notMySeller = await controller.createCustomerSellers(
      existingCustomerId + 1,
      {
        name: 'Mark Twain',
      },
      {description: 'some order'},
    );
    const foundSellers = await controller.findCustomerSellers(
      existingCustomerId,
    );
    expect(foundSellers).to.containEql(seller);
    expect(foundSellers).to.not.containEql(notMySeller);

    const persistedOrders = await orderRepo.find({
      where: {
        customerId: existingCustomerId,
      },
    });
    const persisted = await sellerRepo.find({
      where: {
        or: persistedOrders.map((order: Order) => ({
          id: order.sellerId,
        })),
      },
    });
    expect(persisted).to.deepEqual(foundSellers);
  });

  it('can patch many instances', async () => {
    await controller.createCustomerSellers(
      existingCustomerId,
      {
        name: 'Jam Risser',
      },
      {description: 'some order'},
    );
    await controller.createCustomerSellers(
      existingCustomerId,
      {
        name: 'Jam Risser',
      },
      {description: 'some order'},
    );
    const patchObject = {name: 'Mark Twain'};
    const arePatched = await controller.patchCustomerSellers(
      existingCustomerId,
      patchObject,
    );
    expect(arePatched.count).to.equal(2);
    const patchedData = _.map(
      await controller.findCustomerSellers(existingCustomerId),
      d => _.pick(d, ['name']),
    );
    expect(patchedData).to.eql([
      {
        name: 'Mark Twain',
      },
      {
        name: 'Mark Twain',
      },
    ]);
  });

  it('can delete many instances', async () => {
    await controller.createCustomerSellers(
      existingCustomerId,
      {
        name: 'Jam Risser',
      },
      {description: 'some order'},
    );
    await controller.createCustomerSellers(
      existingCustomerId,
      {
        name: 'Jam Risser',
      },
      {description: 'some order'},
    );
    const deletedSellers = await controller.deleteCustomerSellers(
      existingCustomerId,
    );
    expect(deletedSellers.count).to.equal(2);
    const relatedSellers = await controller.findCustomerSellers(
      existingCustomerId,
    );
    expect(relatedSellers).to.be.empty();
  });

  it("does not delete instances that don't belong to the constrained instance", async () => {
    await controller.createCustomerSellers(
      existingCustomerId,
      {
        name: 'Jam Risser',
      },
      {description: 'some order'},
    );
    const newSeller = {
      name: 'Mark Twain',
    };
    await sellerRepo.create(newSeller);
    await controller.deleteCustomerSellers(existingCustomerId);
    const sellers = await sellerRepo.find();
    expect(sellers).to.have.length(1);
    expect(_.pick(sellers[0], ['name'])).to.eql({
      name: 'Mark Twain',
    });
  });

  it('does not create an array of the related model', async () => {
    await expect(
      customerRepo.create({
        name: 'a customer',
        sellers: [
          {
            name: 'Mark Twain',
          },
        ],
      }),
    ).to.be.rejectedWith(/`sellers` is not defined/);
  });

  // This should be enforced by the database to avoid race conditions
  it.skip('reject create request when the customer does not exist');

  class CustomerController {
    constructor(
      @repository(CustomerRepository)
      protected customerRepository: CustomerRepository,
    ) {}

    async createCustomerSellers(
      customerId: number,
      sellerData: Partial<Seller>,
      orderData?: Partial<Order>,
    ): Promise<Seller> {
      return this.customerRepository
        .sellers(customerId)
        .create(sellerData, orderData);
    }

    async findCustomerSellers(customerId: number) {
      return this.customerRepository.sellers(customerId).find();
    }

    async patchCustomerSellers(customerId: number, seller: Partial<Seller>) {
      return this.customerRepository.sellers(customerId).patch(seller);
    }

    async deleteCustomerSellers(customerId: number) {
      return this.customerRepository.sellers(customerId).delete();
    }
  }

  function givenApplicationWithMemoryDB() {
    class TestApp extends RepositoryMixin(Application) {}

    app = new TestApp();
    app.dataSource(new juggler.DataSource({name: 'db', connector: 'memory'}));
  }

  async function givenBoundCrudRepositoriesForCustomerAndSeller() {
    app.repository(CustomerRepository);
    app.repository(OrderRepository);
    app.repository(SellerRepository);
    customerRepo = await app.getRepository(CustomerRepository);
    orderRepo = await app.getRepository(OrderRepository);
    sellerRepo = await app.getRepository(SellerRepository);
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
