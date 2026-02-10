// Copyright IBM Corp. and LoopBack contributors 2026. All Rights Reserved.
// Node module: @loopback/example-validation-app
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context, InvocationContext} from '@loopback/core';
import {expect} from '@loopback/testlab';
import {ValidatePhoneNumInterceptor} from '../../../interceptors';
import {CoffeeShop} from '../../../models';

describe('ValidatePhoneNumInterceptor (unit)', () => {
  let interceptor: ValidatePhoneNumInterceptor;

  beforeEach(() => {
    interceptor = new ValidatePhoneNumInterceptor();
  });

  describe('value()', () => {
    it('returns the intercept function', () => {
      const interceptFn = interceptor.value();
      expect(interceptFn).to.be.a.Function();
    });
  });

  describe('isAreaCodeValid()', () => {
    it('returns true for Toronto with 416 area code', () => {
      const result = interceptor.isAreaCodeValid('416-111-1111', 'Toronto');
      expect(result).to.be.true();
    });

    it('returns true for Toronto with 647 area code', () => {
      const result = interceptor.isAreaCodeValid('647-222-2222', 'Toronto');
      expect(result).to.be.true();
    });

    it('returns false for Toronto with invalid area code', () => {
      const result = interceptor.isAreaCodeValid('905-333-3333', 'Toronto');
      expect(result).to.be.false();
    });

    it('returns false for Toronto with 999 area code', () => {
      const result = interceptor.isAreaCodeValid('999-444-4444', 'Toronto');
      expect(result).to.be.false();
    });

    it('returns true for non-Toronto cities (always passes)', () => {
      const result = interceptor.isAreaCodeValid('123-456-7890', 'Vancouver');
      expect(result).to.be.true();
    });

    it('returns true for non-Toronto cities with any area code', () => {
      const result = interceptor.isAreaCodeValid('999-999-9999', 'Montreal');
      expect(result).to.be.true();
    });

    it('is case-insensitive for city name', () => {
      const result1 = interceptor.isAreaCodeValid('416-111-1111', 'toronto');
      const result2 = interceptor.isAreaCodeValid('416-111-1111', 'TORONTO');
      const result3 = interceptor.isAreaCodeValid('416-111-1111', 'ToRoNtO');
      expect(result1).to.be.true();
      expect(result2).to.be.true();
      expect(result3).to.be.true();
    });

    it('extracts area code correctly from phone number', () => {
      const result = interceptor.isAreaCodeValid('416-123-4567', 'Toronto');
      expect(result).to.be.true();
    });
  });

  describe('intercept()', () => {
    it('allows valid coffee shop creation for Toronto with 416', async () => {
      const coffeeShop = new CoffeeShop({
        city: 'Toronto',
        phoneNum: '416-111-1111',
        capacity: 50,
      });

      const invocationCtx = givenInvocationContext('create', [coffeeShop]);
      const next = async () => coffeeShop;

      const result = await interceptor.intercept(invocationCtx, next);
      expect(result).to.equal(coffeeShop);
    });

    it('allows valid coffee shop creation for Toronto with 647', async () => {
      const coffeeShop = new CoffeeShop({
        city: 'Toronto',
        phoneNum: '647-222-2222',
        capacity: 50,
      });

      const invocationCtx = givenInvocationContext('create', [coffeeShop]);
      const next = async () => coffeeShop;

      const result = await interceptor.intercept(invocationCtx, next);
      expect(result).to.equal(coffeeShop);
    });

    it('throws error for Toronto with invalid area code', async () => {
      const coffeeShop = new CoffeeShop({
        city: 'Toronto',
        phoneNum: '905-333-3333',
        capacity: 50,
      });

      const invocationCtx = givenInvocationContext('create', [coffeeShop]);
      const next = async () => coffeeShop;

      await expect(
        interceptor.intercept(invocationCtx, next),
      ).to.be.rejectedWith('Area code and city do not match');
    });

    it('throws error with statusCode 400 for invalid area code', async () => {
      const coffeeShop = new CoffeeShop({
        city: 'Toronto',
        phoneNum: '999-444-4444',
        capacity: 50,
      });

      const invocationCtx = givenInvocationContext('create', [coffeeShop]);
      const next = async () => coffeeShop;

      try {
        await interceptor.intercept(invocationCtx, next);
        throw new Error('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.equal('Area code and city do not match');
        expect(err.statusCode).to.equal(400);
      }
    });

    it('allows valid coffee shop for non-Toronto cities', async () => {
      const coffeeShop = new CoffeeShop({
        city: 'Vancouver',
        phoneNum: '604-555-5555',
        capacity: 50,
      });

      const invocationCtx = givenInvocationContext('create', [coffeeShop]);
      const next = async () => coffeeShop;

      const result = await interceptor.intercept(invocationCtx, next);
      expect(result).to.equal(coffeeShop);
    });

    it('validates on updateById method', async () => {
      const coffeeShop = new CoffeeShop({
        city: 'Toronto',
        phoneNum: '905-666-6666',
        capacity: 50,
      });

      const invocationCtx = givenInvocationContext('updateById', [
        '123',
        coffeeShop,
      ]);
      const next = async () => undefined;

      await expect(
        interceptor.intercept(invocationCtx, next),
      ).to.be.rejectedWith('Area code and city do not match');
    });

    it('allows valid updateById for Toronto with 416', async () => {
      const coffeeShop = new CoffeeShop({
        city: 'Toronto',
        phoneNum: '416-777-7777',
        capacity: 50,
      });

      const invocationCtx = givenInvocationContext('updateById', [
        '123',
        coffeeShop,
      ]);
      const next = async () => undefined;

      const result = await interceptor.intercept(invocationCtx, next);
      expect(result).to.be.undefined();
    });

    it('skips validation for methods other than create and updateById', async () => {
      const invocationCtx = givenInvocationContext('find', []);
      const next = async () => [];

      const result = await interceptor.intercept(invocationCtx, next);
      expect(result).to.deepEqual([]);
    });

    it('skips validation when coffee shop is undefined', async () => {
      const invocationCtx = givenInvocationContext('create', [undefined]);
      const next = async () => undefined;

      const result = await interceptor.intercept(invocationCtx, next);
      expect(result).to.be.undefined();
    });

    it('calls next() and returns its result on success', async () => {
      const coffeeShop = new CoffeeShop({
        city: 'Toronto',
        phoneNum: '416-888-8888',
        capacity: 50,
      });

      const invocationCtx = givenInvocationContext('create', [coffeeShop]);
      const expectedResult = {id: '123', ...coffeeShop};
      const next = async () => expectedResult;

      const result = await interceptor.intercept(invocationCtx, next);
      expect(result).to.equal(expectedResult);
    });
  });

  describe('BINDING_KEY', () => {
    it('has correct binding key', () => {
      expect(ValidatePhoneNumInterceptor.BINDING_KEY).to.equal(
        'interceptors.ValidatePhoneNumInterceptor',
      );
    });
  });

  function givenInvocationContext(
    methodName: string,
    args: unknown[],
  ): InvocationContext {
    const context = new Context();
    return {
      target: {},
      methodName,
      args,
      getBinding: context.getBinding.bind(context),
      getConfigAsValueOrPromise:
        context.getConfigAsValueOrPromise.bind(context),
      getValueOrPromise: context.getValueOrPromise.bind(context),
      get: context.get.bind(context),
      getSync: context.getSync.bind(context),
    } as InvocationContext;
  }
});
