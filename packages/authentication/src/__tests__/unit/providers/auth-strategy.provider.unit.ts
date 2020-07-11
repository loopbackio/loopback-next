// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context} from '@loopback/core';
import {expect} from '@loopback/testlab';
import {
  AuthenticationBindings,
  AuthenticationStrategy,
  AuthenticationStrategyProvider,
} from '../../..';
import {AuthenticationMetadata} from '../../../types';
import {
  mockAuthenticationMetadata,
  mockAuthenticationMetadata2,
} from '../fixtures/mock-metadata';
import {MockStrategy, MockStrategy2} from '../fixtures/mock-strategy';

describe('AuthStrategyProvider', () => {
  let strategyProvider: AuthenticationStrategyProvider;
  const mockStrategy = new MockStrategy();
  const mockStrategy2 = new MockStrategy2();

  beforeEach(() => {
    givenAuthenticationStrategyProvider(
      [mockStrategy, mockStrategy2],
      [mockAuthenticationMetadata, mockAuthenticationMetadata2],
    );
  });

  describe('value()', () => {
    it('should return the authentication strategies', async () => {
      const strategies = await strategyProvider.value();

      expect(strategies).to.not.be.undefined();
      expect(strategies?.[0]).to.be.equal(mockStrategy);
      expect(strategies?.[1]).to.be.equal(mockStrategy2);
    });

    it('should only return the authentication strategy specified in the authentication metadata', async () => {
      givenAuthenticationStrategyProvider(
        [mockStrategy, mockStrategy2],
        [mockAuthenticationMetadata],
      );

      const strategies = await strategyProvider.value();

      expect(strategies?.length).to.be.equal(1);
      expect(strategies?.[0]).to.be.equal(mockStrategy);
    });

    it('should return undefined if the authentication metadata is not available', async () => {
      givenAuthenticationStrategyProvider([mockStrategy], undefined);

      const strategies = await strategyProvider.value();

      expect(strategies).to.be.undefined();
    });

    it('should throw an error if the authentication strategy is not available', async () => {
      givenAuthenticationStrategyProvider([], [mockAuthenticationMetadata]);

      await expect(strategyProvider.value()).to.be.rejected();

      givenAuthenticationStrategyProvider([], [mockAuthenticationMetadata2]);

      await expect(strategyProvider.value()).to.be.rejected();
    });
  });

  describe('context.get(bindingKey)', () => {
    it('should return the authentication strategies', async () => {
      const context = new Context();
      context
        .bind(AuthenticationBindings.STRATEGY)
        .to([mockStrategy, mockStrategy2]);
      const strategies = await context.get<AuthenticationStrategy[]>(
        AuthenticationBindings.STRATEGY,
      );

      expect(strategies[0]).to.be.equal(mockStrategy);
      expect(strategies[1]).to.be.equal(mockStrategy2);
    });

    it('should return undefined if no authentication strategies are defined', async () => {
      const context = new Context();
      context.bind(AuthenticationBindings.STRATEGY).to(undefined);
      const strategies = await context.get<AuthenticationStrategy[]>(
        AuthenticationBindings.STRATEGY,
      );

      expect(strategies).to.be.undefined();
    });
  });

  function givenAuthenticationStrategyProvider(
    strategies: AuthenticationStrategy[],
    metadata: AuthenticationMetadata[] | undefined,
  ) {
    strategyProvider = new AuthenticationStrategyProvider(
      () => Promise.resolve(strategies),
      metadata,
    );
  }
});
