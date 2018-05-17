// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {OrderRepository} from './repositories/order.repository';
import {CustomerRepository} from './repositories/customer.repository';
import {memoryDs} from './fixtures/datasources/memory.datasource';
import {Customer} from './models/customer.model';
import {DefaultHasManyEntityCrudRepository} from '../../../../src/repositories/relation.repository';

describe('hasMany relationship', () => {
  let orderRepo: OrderRepository;
  let customerRepo: CustomerRepository;
  beforeEach(givenCustomerAndOrderRepositories);

  it('creates a customer with an order and retrieves it', async () => {
    const c1: Customer = await customerRepo.create({
      name: 'John Smith',
      email: 'johnsmith@yahoo.com',
    });

    // TODO: make this happen automatically
    c1.customerOrders = new DefaultHasManyEntityCrudRepository(
      c1,
      orderRepo,
      'customerId',
    );
    const order = await c1.customerOrders.create({
      desc: 'order1 description',
      date: new Date().toISOString(),
    });

    //make sure that the order created has
    // customerId constraint enforced
    expect(order).to.have.properties({
      // FIXME: use something more elegant than toString
      customerId: c1.getId().toString(),
      desc: 'order1 description',
    });

    // if we were to find the order from the order repository
    // we should get the same result.
    let foundOrder = await orderRepo.findById(order.id);
    expect(foundOrder).to.have.properties({
      desc: 'order1 description',
      customerId: c1.getId().toString(),
    });

    /* // we should also be able to support inclusion of orders from
    // a customer repository get request
    const includeFilter = new FilterBuilder().include('orders').filter;
    let foundCustomer = await customerRepo.findById(c1.id, includeFilter);
    expect(foundCustomer).to.have.properties({
      name: c1.name,
      email: c1.email,
      orders: [
        {
          desc: 'order1 description',
          customerId: c1.getId(),
          id: order.id,
        },
      ],
    });
    let orderViaCustomer = await foundCustomer.orders.find({
      where: {customerId: foundCustomer.id},
    });

    expect(orderViaCustomer).to.have.properties({
      desc: 'order1 description',
      customerId: foundCustomer.getId(),
    }); */
  });

  function givenCustomerAndOrderRepositories() {
    orderRepo = new OrderRepository(memoryDs);
    customerRepo = new CustomerRepository(memoryDs);
  }
});
