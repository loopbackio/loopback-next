// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/authorization
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context, inject, invokeMethod, Provider} from '@loopback/context';
import {Application} from '@loopback/core';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {expect} from '@loopback/testlab';
import * as casbin from 'casbin';
import * as path from 'path';
import {
  AuthorizationComponent,
  AuthorizationContext,
  AuthorizationDecision,
  AuthorizationMetadata,
  AuthorizationRequest,
  authorize,
  Authorizer,
} from '../..';
import {AuthorizationTags} from '../../keys';

describe('Authorization', () => {
  let app: Application;
  let controller: OrderController;
  let reqCtx: Context;
  let events: string[];

  before(givenApplicationAndAuthorizer);
  beforeEach(() => givenRequestContext());

  it('allows placeOrder for everyone', async () => {
    const orderId = await invokeMethod(controller, 'placeOrder', reqCtx, [
      {
        customerId: 'bob',
        productId: 'product-a',
        quantity: 10,
        price: 320,
      },
    ]);
    expect(orderId).to.eql('order-1');
    expect(events).to.containEql('OrderController.prototype.placeOrder');
  });

  it('allows cancelOrder for customer_service', async () => {
    givenRequestContext({
      [securityId]: 'customer_service',
      name: 'customer_service',
    });
    const orderId = await controller.placeOrder({
      customerId: 'bob',
      productId: 'product-a',
      quantity: 10,
      price: 320,
    });
    const result = await invokeMethod(controller, 'cancelOrder', reqCtx, [
      orderId,
    ]);
    expect(result).to.be.true();
    expect(events).to.containEql('OrderController.prototype.cancelOrder');
  });

  it('denies cancelOrder for bob', async () => {
    givenRequestContext({[securityId]: 'bob', name: 'bob'});
    const orderId = await controller.placeOrder({
      customerId: 'bob',
      productId: 'product-a',
      quantity: 10,
      price: 320,
    });
    const result = invokeMethod(controller, 'cancelOrder', reqCtx, [orderId]);
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

    @authorize({
      resource: 'order',
      scopes: ['create'],
    })
    async placeOrder(order: Order) {
      order.id = `order-${this.orders.length + 1}`;
      this.orders.push(order);
      return order.id;
    }

    @authorize({
      resource: 'order',
      scopes: ['delete'],
    })
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
    app.bind('casbin.enforcer').toDynamicValue(createEnforcer);
    app
      .bind('authorizationProviders.casbin-provider')
      .toProvider(CasbinAuthorizationProvider)
      .tag(AuthorizationTags.AUTHORIZER);
  }

  function givenRequestContext(
    user: UserProfile = {[securityId]: 'alice', name: 'alice'},
  ) {
    events = [];
    reqCtx = new Context(app);
    reqCtx.bind(SecurityBindings.USER).to(user);
    controller = new OrderController();
  }

  /**
   * Provider of a function which authenticates
   */
  class CasbinAuthorizationProvider implements Provider<Authorizer> {
    constructor(@inject('casbin.enforcer') private enforcer: casbin.Enforcer) {}

    /**
     * @returns authenticateFn
     */
    value(): Authorizer {
      return this.authorize.bind(this);
    }

    async authorize(
      authorizationCtx: AuthorizationContext,
      metadata: AuthorizationMetadata,
    ) {
      events.push(authorizationCtx.resource);
      const request: AuthorizationRequest = {
        subject: authorizationCtx.principals[0].name,
        object: metadata.resource || authorizationCtx.resource,
        action: (metadata.scopes && metadata.scopes[0]) || 'execute',
      };
      const allow = await this.enforcer.enforce(
        request.subject,
        request.object,
        request.action,
      );
      if (allow) return AuthorizationDecision.ALLOW;
      else if (allow === false) return AuthorizationDecision.DENY;
      return AuthorizationDecision.ABSTAIN;
    }
  }

  async function createEnforcer() {
    const conf = path.resolve(
      __dirname,
      '../../../fixtures/casbin/rbac_model.conf',
    );
    const policy = path.resolve(
      __dirname,
      '../../../fixtures/casbin/rbac_policy.csv',
    );
    return casbin.newEnforcer(conf, policy);
  }
});
