// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/authorization
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context, invokeMethod, Provider} from '@loopback/context';
import {Application} from '@loopback/core';
import {SecurityBindings, securityId} from '@loopback/security';
import {expect} from '@loopback/testlab';
import {
  AuthorizationComponent,
  AuthorizationContext,
  AuthorizationDecision,
  AuthorizationMetadata,
  authorize,
  Authorizer,
  EVERYONE,
} from '../..';
import {AuthorizationTags} from '../../keys';

describe('Authorization', () => {
  let app: Application;
  let controller: OrderController;
  let reqCtx: Context;
  let events: string[];

  before(givenApplicationAndAuthorizer);
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

  function givenApplicationAndAuthorizer() {
    app = new Application();
    app.component(AuthorizationComponent);
    app
      .bind('authorizationProviders.my-provider')
      .toProvider(MyAuthorizationProvider)
      .tag(AuthorizationTags.AUTHORIZER);
  }

  function givenRequestContext() {
    events = [];
    reqCtx = new Context(app);
    reqCtx
      .bind(SecurityBindings.USER)
      .to({[securityId]: 'user-01', name: 'user-01'});
    controller = new OrderController();
  }

  /**
   * Provider of a function which authenticates
   */
  class MyAuthorizationProvider implements Provider<Authorizer> {
    /**
     * @returns authenticateFn
     */
    value(): Authorizer {
      return this.authorize.bind(this);
    }

    async authorize(
      context: AuthorizationContext,
      metadata: AuthorizationMetadata,
    ) {
      events.push(context.resource);
      if (
        context.resource === 'OrderController.prototype.cancelOrder' &&
        context.principals[0].name === 'user-01'
      ) {
        return AuthorizationDecision.DENY;
      }
      return AuthorizationDecision.ALLOW;
    }
  }
});
