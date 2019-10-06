// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/authorization
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context, invokeMethod, Provider} from '@loopback/context';
import {Application} from '@loopback/core';
import {SecurityBindings, securityId} from '@loopback/security';
import {expect} from '@loopback/testlab';
import {AuthorizationComponent} from '../../authorization-component';
import {authorize} from '../../decorators/authorize';
import {AuthorizationTags} from '../../keys';
import {
  AuthorizationDecision,
  AuthorizationOptions,
  Authorizer,
} from '../../types';

const Deny = AuthorizationDecision.DENY;
const Allow = AuthorizationDecision.ALLOW;
const Abstain = AuthorizationDecision.ABSTAIN;

type DecisionMatrix = [
  AuthorizationOptions,
  AuthorizationDecision[],
  AuthorizationDecision,
][];

// Decisions not impacted by options.precedence or options.defaultDecision
const matrix1: DecisionMatrix = [
  [{}, [Deny, Deny, Deny], Deny],
  [{}, [Allow, Allow, Allow], Allow],
  [{}, [Abstain, Allow, Abstain], Allow],
  [{}, [Abstain, Deny, Abstain], Deny],

  [{defaultDecision: Deny}, [Deny, Deny, Deny], Deny],
  [{defaultDecision: Deny}, [Allow, Allow, Allow], Allow],
  [{defaultDecision: Deny}, [Abstain, Allow, Abstain], Allow],
  [{defaultDecision: Deny}, [Abstain, Deny, Abstain], Deny],

  [{defaultDecision: Allow}, [Deny, Deny, Deny], Deny],
  [{defaultDecision: Allow}, [Allow, Allow, Allow], Allow],
  [{defaultDecision: Allow}, [Abstain, Allow, Abstain], Allow],
  [{defaultDecision: Allow}, [Abstain, Deny, Abstain], Deny],

  [{precedence: Deny}, [Deny, Deny, Deny], Deny],
  [{precedence: Deny}, [Allow, Allow, Allow], Allow],
  [{precedence: Deny}, [Abstain, Allow, Abstain], Allow],
  [{precedence: Deny}, [Abstain, Deny, Abstain], Deny],

  [{precedence: Allow}, [Deny, Deny, Deny], Deny],
  [{precedence: Allow}, [Allow, Allow, Allow], Allow],
  [{precedence: Allow}, [Abstain, Allow, Abstain], Allow],
  [{precedence: Allow}, [Abstain, Deny, Abstain], Deny],
];

// Decisions controlled by options.precedence
const matrix2: DecisionMatrix = [
  [{}, [Deny, Allow, Abstain], Deny],
  [{precedence: Deny}, [Deny, Allow, Abstain], Deny],
  [{precedence: Allow}, [Deny, Allow, Abstain], Allow],

  [{}, [Allow, Abstain, Deny], Deny],
  [{precedence: Deny}, [Allow, Abstain, Deny], Deny],
  [{precedence: Allow}, [Allow, Abstain, Deny], Allow],
];

// Decisions controlled by options.defaultDecision
const matrix3: DecisionMatrix = [
  [{}, [Abstain, Abstain, Abstain], Deny],
  [{defaultDecision: Deny}, [Abstain, Abstain, Abstain], Deny],
  [{defaultDecision: Allow}, [Abstain, Abstain, Abstain], Allow],
];

const matrix4: DecisionMatrix = [
  [{defaultMetadata: {}}, [Abstain, Abstain, Abstain], Deny],
  [
    {defaultMetadata: {}, defaultDecision: Deny},
    [Abstain, Abstain, Abstain],
    Deny,
  ],
  [
    {defaultMetadata: {}, defaultDecision: Allow},
    [Abstain, Abstain, Abstain],
    Allow,
  ],
];

// Decisions controlled by options.defaultDecision
const matrix5: DecisionMatrix = [
  [{}, [Abstain, Abstain, Abstain], Allow],
  [{defaultDecision: Deny}, [Abstain, Abstain, Abstain], Allow],
  [{defaultDecision: Allow}, [Abstain, Abstain, Abstain], Allow],
];

describe('Authorization', () => {
  let app: Application;
  let controller: OrderController;
  let reqCtx: Context;

  it('always use explicit decisions', async () => {
    await testCancelOrder(matrix1);
  });

  it('honors decisions and options.precedence', async () => {
    await testCancelOrder(matrix2);
  });

  it('honors decisions and options.defaultDecision', async () => {
    await testCancelOrder(matrix3);
  });

  it('honors decisions with options.defaultMetadata', async () => {
    await testPlaceOrder(matrix4);
  });

  it('honors decisions without options.defaultMetadata', async () => {
    await testPlaceOrder(matrix5);
  });

  async function testCancelOrder(matrix: DecisionMatrix) {
    let index = 0;
    for (const row of matrix) {
      givenRequestContext();
      setupAuthorization(row[0], ...row[1]);
      const finalDecision = await cancelOrder();
      const expectedDecision = row[2];
      expect(`${index}:${finalDecision}`).to.equal(
        `${index}:${expectedDecision}`,
      );
      index++;
    }
  }

  async function testPlaceOrder(matrix: DecisionMatrix) {
    let index = 0;
    for (const row of matrix) {
      givenRequestContext();
      setupAuthorization(row[0], ...row[1]);
      const finalDecision = await placeOrder();
      const expectedDecision = row[2];
      expect(`${index}:${finalDecision}`).to.equal(
        `${index}:${expectedDecision}`,
      );
      index++;
    }
  }

  async function cancelOrder() {
    let finalDecision = Deny;
    try {
      await invokeMethod(controller, 'cancelOrder', reqCtx, ['order-01']);
      finalDecision = Allow;
    } catch (err) {
      finalDecision = Deny;
    }
    return finalDecision;
  }

  async function placeOrder() {
    let finalDecision = Deny;
    try {
      await invokeMethod(controller, 'placeOrder', reqCtx, ['prod-01', 10]);
      finalDecision = Allow;
    } catch (err) {
      finalDecision = Deny;
    }
    return finalDecision;
  }

  class OrderController {
    @authorize({})
    async cancelOrder(orderId: string) {
      return orderId;
    }

    // This method is not decorated with `@authorize`. The decision depends on
    // authorizationOptions.defaultMetadata
    async placeOrder(productId: string, quantity: number) {
      return '001';
    }
  }

  function setupAuthorization(
    options: AuthorizationOptions,
    ...decisions: AuthorizationDecision[]
  ) {
    const binding = app.component(AuthorizationComponent);
    if (options) {
      app.configure(binding.key).to(options);
    }

    let index = 0;
    for (const decision of decisions) {
      app
        .bind(`authorizationProviders.${decision}-${index++}`)
        .toProvider(createAuthorizationProvider(decision))
        .tag(AuthorizationTags.AUTHORIZER);
    }
  }

  function givenRequestContext() {
    app = new Application();
    reqCtx = new Context(app);
    reqCtx
      .bind(SecurityBindings.USER)
      .to({[securityId]: 'user-01', name: 'user-01'});
    controller = new OrderController();
  }

  function createAuthorizationProvider(decision: AuthorizationDecision) {
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

      async authorize() {
        return decision;
      }
    }

    return MyAuthorizationProvider;
  }
});
