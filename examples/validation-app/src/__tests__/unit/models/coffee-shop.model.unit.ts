// Copyright IBM Corp. and LoopBack contributors 2026. All Rights Reserved.
// Node module: @loopback/example-validation-app
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {CoffeeShop} from '../../../models';

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('CoffeeShop (unit)', () => {
  describe('constructor', () => {
    it('creates an instance with valid data', () => {
      const data = {
        shopId: '1',
        city: 'Toronto',
        phoneNum: '416-111-1111',
        capacity: 50,
        rating: '4',
      };
      const coffeeShop = new CoffeeShop(data);
      expect(coffeeShop).to.be.instanceOf(CoffeeShop);
      expect(coffeeShop.shopId).to.equal('1');
      expect(coffeeShop.city).to.equal('Toronto');
      expect(coffeeShop.phoneNum).to.equal('416-111-1111');
      expect(coffeeShop.capacity).to.equal(50);
      expect(coffeeShop.rating).to.equal('4');
    });

    it('creates an instance without optional shopId', () => {
      const data = {
        city: 'Toronto',
        phoneNum: '416-111-1111',
        capacity: 50,
      };
      const coffeeShop = new CoffeeShop(data);
      expect(coffeeShop).to.be.instanceOf(CoffeeShop);
      expect(coffeeShop.shopId).to.be.undefined();
    });

    it('creates an instance without optional rating', () => {
      const data = {
        city: 'Toronto',
        phoneNum: '416-111-1111',
        capacity: 50,
      };
      const coffeeShop = new CoffeeShop(data);
      expect(coffeeShop).to.be.instanceOf(CoffeeShop);
      expect(coffeeShop.rating).to.be.undefined();
    });

    it('creates an instance with partial data', () => {
      const data = {
        city: 'Tokyo',
      };
      const coffeeShop = new CoffeeShop(data);
      expect(coffeeShop).to.be.instanceOf(CoffeeShop);
      expect(coffeeShop.city).to.equal('Tokyo');
    });

    it('creates an instance with empty data', () => {
      const coffeeShop = new CoffeeShop();
      expect(coffeeShop).to.be.instanceOf(CoffeeShop);
    });
  });

  describe('property validation schemas', () => {
    it('has correct jsonSchema for city property', () => {
      const cityProperty = (CoffeeShop.definition.properties.city as any)
        .jsonSchema;
      expect(cityProperty).to.containEql({
        maxLength: 10,
        minLength: 5,
        errorMessage: 'City name must be between 5 and 10 characters',
      });
    });

    it('has correct jsonSchema for phoneNum property', () => {
      const phoneNumProperty = (
        CoffeeShop.definition.properties.phoneNum as any
      ).jsonSchema;
      expect(phoneNumProperty).to.containEql({
        pattern: '\\d{3}-\\d{3}-\\d{4}',
        errorMessage: 'Invalid phone number',
      });
    });

    it('has correct jsonSchema for capacity property', () => {
      const capacityProperty = (
        CoffeeShop.definition.properties.capacity as any
      ).jsonSchema;
      expect(capacityProperty.maximum).to.equal(100);
      expect(capacityProperty.minimum).to.equal(10);
      expect(capacityProperty.errorMessage).to.containEql({
        maximum: 'Capacity cannot exceed 100',
        minimum: 'Capacity cannot be less than 1',
      });
    });

    it('has correct jsonSchema for rating property', () => {
      const ratingProperty = (CoffeeShop.definition.properties.rating as any)
        .jsonSchema;
      expect(ratingProperty).to.containEql({
        range: [1, 5],
        errorMessage: 'Rating must be between 1 and 5',
      });
    });
  });

  describe('property types', () => {
    it('has shopId as string type', () => {
      expect(CoffeeShop.definition.properties.shopId.type).to.equal('string');
    });

    it('has city as required string type', () => {
      expect(CoffeeShop.definition.properties.city.type).to.equal('string');
      expect(CoffeeShop.definition.properties.city.required).to.be.true();
    });

    it('has phoneNum as required string type', () => {
      expect(CoffeeShop.definition.properties.phoneNum.type).to.equal('string');
      expect(CoffeeShop.definition.properties.phoneNum.required).to.be.true();
    });

    it('has capacity as required number type', () => {
      expect(CoffeeShop.definition.properties.capacity.type).to.equal('number');
      expect(CoffeeShop.definition.properties.capacity.required).to.be.true();
    });

    it('has rating as optional number type', () => {
      expect(CoffeeShop.definition.properties.rating.type).to.equal('number');
      expect(
        CoffeeShop.definition.properties.rating.required,
      ).to.be.undefined();
    });
  });

  describe('model metadata', () => {
    it('has shopId marked as id property', () => {
      expect(CoffeeShop.definition.properties.shopId.id).to.be.true();
    });

    it('has shopId marked as generated', () => {
      expect(CoffeeShop.definition.properties.shopId.generated).to.be.true();
    });

    it('has correct model name', () => {
      expect(CoffeeShop.modelName).to.equal('CoffeeShop');
    });
  });

  describe('toJSON', () => {
    it('serializes to JSON correctly', () => {
      const data = {
        shopId: '1',
        city: 'Toronto',
        phoneNum: '416-111-1111',
        capacity: 50,
        rating: '4',
      };
      const coffeeShop = new CoffeeShop(data);
      const json = coffeeShop.toJSON();
      expect(json).to.deepEqual(data);
    });

    it('serializes without optional properties', () => {
      const data = {
        city: 'Toronto',
        phoneNum: '416-111-1111',
        capacity: 50,
      };
      const coffeeShop = new CoffeeShop(data);
      const json = coffeeShop.toJSON();
      expect(json).to.deepEqual(data);
    });
  });
});
