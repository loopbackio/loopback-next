// Copyright IBM Corp. and LoopBack contributors 2026. All Rights Reserved.
// Node module: @loopback/example-validation-app
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {juggler} from '@loopback/repository';
import {expect} from '@loopback/testlab';
import {CoffeeShop} from '../../../models';
import {CoffeeShopRepository} from '../../../repositories';

describe('CoffeeShopRepository (unit)', () => {
  let repository: CoffeeShopRepository;
  let dataSource: juggler.DataSource;

  beforeEach(() => {
    dataSource = new juggler.DataSource({
      name: 'db',
      connector: 'memory',
    });
    repository = new CoffeeShopRepository(dataSource);
  });

  describe('constructor', () => {
    it('creates repository with datasource', () => {
      expect(repository).to.be.instanceOf(CoffeeShopRepository);
    });

    it('uses CoffeeShop model', () => {
      expect(repository.entityClass).to.equal(CoffeeShop);
    });
  });

  describe('CRUD operations', () => {
    it('creates a coffee shop', async () => {
      const coffeeShop = new CoffeeShop({
        city: 'Toronto',
        phoneNum: '416-123-4567',
        capacity: 50,
        rating: '4',
      });

      const created = await repository.create(coffeeShop);

      expect(created).to.have.property('shopId');
      expect(created.city).to.equal('Toronto');
      expect(created.phoneNum).to.equal('416-123-4567');
      expect(created.capacity).to.equal(50);
    });

    it('finds all coffee shops', async () => {
      await repository.create(
        new CoffeeShop({
          city: 'Toronto',
          phoneNum: '416-123-4567',
          capacity: 50,
          rating: '4',
        }),
      );
      await repository.create(
        new CoffeeShop({
          city: 'Vancouver',
          phoneNum: '604-123-4567',
          capacity: 40,
          rating: '5',
        }),
      );

      const shops = await repository.find();

      expect(shops).to.have.length(2);
    });

    it('finds coffee shops by filter', async () => {
      await repository.create(
        new CoffeeShop({
          city: 'Toronto',
          phoneNum: '416-123-4567',
          capacity: 50,
          rating: '4',
        }),
      );
      await repository.create(
        new CoffeeShop({
          city: 'Vancouver',
          phoneNum: '604-123-4567',
          capacity: 40,
          rating: '5',
        }),
      );

      const shops = await repository.find({where: {city: 'Toronto'}});

      expect(shops).to.have.length(1);
      expect(shops[0].city).to.equal('Toronto');
    });

    it('counts coffee shops', async () => {
      await repository.create(
        new CoffeeShop({
          city: 'Toronto',
          phoneNum: '416-123-4567',
          capacity: 50,
          rating: '4',
        }),
      );

      const count = await repository.count();

      expect(count.count).to.equal(1);
    });

    it('updates coffee shop by id', async () => {
      const created = await repository.create(
        new CoffeeShop({
          city: 'Toronto',
          phoneNum: '416-123-4567',
          capacity: 50,
          rating: '4',
        }),
      );

      await repository.updateById(created.shopId, {capacity: 60});

      const updated = await repository.findById(created.shopId);
      expect(updated.capacity).to.equal(60);
    });

    it('deletes coffee shop by id', async () => {
      const created = await repository.create(
        new CoffeeShop({
          city: 'Toronto',
          phoneNum: '416-123-4567',
          capacity: 50,
          rating: '4',
        }),
      );

      await repository.deleteById(created.shopId);

      const count = await repository.count();
      expect(count.count).to.equal(0);
    });
  });

  describe('validation', () => {
    it('enforces required fields', async () => {
      const invalidShop = new CoffeeShop({
        city: 'Toronto',
        // missing phoneNum and capacity
      } as Partial<CoffeeShop>);

      await expect(repository.create(invalidShop)).to.be.rejected();
    });
  });
});

// Made with Bob
