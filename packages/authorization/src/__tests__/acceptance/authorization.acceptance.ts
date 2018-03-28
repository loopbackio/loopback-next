// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/authorization
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context, invokeMethod, Provider} from '@loopback/context';
import {Application} from '@loopback/core';
import {expect} from '@loopback/testlab';
import {AuthorizationComponent} from '../../authorization-component';
import {authorize} from '../../decorators/authorize';
import {
  AuthorizationDecision,
  AuthorizationMetadata,
  AuthorizeFn,
  EVERYONE,
  AuthorizationContext,
} from '../../types';

describe('Authorization', () => {
  let app: Application;
  let controller: OrderController;
  let reqCtx: Context;
  let events: string[];

  before(givenApplication);
  beforeEach(givenRequestContext);

  it('allows placeOrder for everyone', async () => {
    const orderId = await invokeMethod(controller, 'placeOrder', reqCtx, [
      {
        customerId: 'customer-01',
        productId: 'product-a',
        quantity: 10,
        price: 320,
      },
    ]);
    expect(orderId).to.eql('order-1');
    expect(events).to.containEql('OrderController.prototype.placeOrder');
  });

  it('denies cancelOrder for regular user', async () => {
    const result = invokeMethod(controller, 'cancelOrder', reqCtx, [
      'order-01',
    ]);
    await expect(result).to.be.rejectedWith('Access denied');
    expect(events).to.containEql('OrderController.prototype.cancelOrder');
  });

  class Order {
    id?: string;
    customerId: string;
    productId: string;
    quantity: number;
    price: number;
  }

  class OrderController {
    orders: Order[] = [];

    @authorize({allowedRoles: [EVERYONE], scopes: ['order.create']})
    async placeOrder(order: Order) {
      order.id = `order-${this.orders.length + 1}`;
      this.orders.push(order);
      return order.id;
    }

    @authorize({allowedRoles: ['customer-service'], scopes: ['order.delete']})
    async cancelOrder(orderId: string) {
      const index = this.orders.findIndex(order => order.id === orderId);
      if (index === -1) return false;
      this.orders.splice(index, 1);
      return true;
    }
  }

  function givenApplication() {
    app = new Application();
    app.component(AuthorizationComponent);
    app
      .bind('authorizationProviders.my-provider')
      .toProvider(MyAuthorizationProvider)
      .tag('authorizationProvider');
  }

  function givenRequestContext() {
    events = [];
    reqCtx = new Context(app);
    reqCtx.bind('current.user').to('user-01');
    controller = new OrderController();
  }

  /**
   * Provider of a function which authenticates
   */
  class MyAuthorizationProvider implements Provider<AuthorizeFn> {
    constructor() {}

    /**
     * @returns authenticateFn
     */
    value(): AuthorizeFn {
      return async (
        securityContext: AuthorizationContext,
        metadata: AuthorizationMetadata,
      ) => {
        return this.authorize(securityContext, metadata);
      };
    }

    authorize(
      securityContext: AuthorizationContext,
      metadata: AuthorizationMetadata,
    ) {
      events.push(securityContext.resource);
      if (
        securityContext.resource === 'OrderController.prototype.cancelOrder' &&
        securityContext.principals[0].name === 'user-01'
      ) {
        return AuthorizationDecision.DENY;
      }
      return AuthorizationDecision.ALLOW;
    }
  }
});
