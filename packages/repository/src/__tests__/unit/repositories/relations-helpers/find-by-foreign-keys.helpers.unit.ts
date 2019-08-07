// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {findByForeignKeys} from '../../../..';
import {ProductRepository, testdb} from './relations-helpers-fixtures';

describe('findByForeignKeys', () => {
  let productRepo: ProductRepository;

  before(() => {
    productRepo = new ProductRepository(testdb);
  });

  beforeEach(async () => {
    await productRepo.deleteAll();
  });

  it('returns an empty array when no foreign keys are passed in', async () => {
    const fkIds: number[] = [];
    await productRepo.create({id: 1, name: 'product', categoryId: 1});
    const products = await findByForeignKeys(productRepo, 'categoryId', fkIds);
    expect(products).to.be.empty();
  });

  it('returns an empty array when no instances have the foreign key value', async () => {
    await productRepo.create({id: 1, name: 'product', categoryId: 1});
    const products = await findByForeignKeys(productRepo, 'categoryId', 2);
    expect(products).to.be.empty();
  });

  it('returns an empty array when no instances have the foreign key values', async () => {
    await productRepo.create({id: 1, name: 'product', categoryId: 1});
    const products = await findByForeignKeys(productRepo, 'categoryId', [2, 3]);
    expect(products).to.be.empty();
  });

  it('returns all instances that have the foreign key value', async () => {
    const pens = await productRepo.create({name: 'pens', categoryId: 1});
    const pencils = await productRepo.create({name: 'pencils', categoryId: 1});
    const products = await findByForeignKeys(productRepo, 'categoryId', 1);
    expect(products).to.deepEqual([pens, pencils]);
  });

  it('does not include instances with different foreign key values', async () => {
    const pens = await productRepo.create({name: 'pens', categoryId: 1});
    const pencils = await productRepo.create({name: 'pencils', categoryId: 2});
    const products = await findByForeignKeys(productRepo, 'categoryId', 1);
    expect(products).to.deepEqual([pens]);
    expect(products).to.not.containDeep(pencils);
  });

  it('includes instances when there is one value in the array of foreign key values', async () => {
    const pens = await productRepo.create({name: 'pens', categoryId: 1});
    const pencils = await productRepo.create({name: 'pencils', categoryId: 2});
    const products = await findByForeignKeys(productRepo, 'categoryId', [2]);
    expect(products).to.deepEqual([pencils]);
    expect(products).to.not.containDeep(pens);
  });

  it('returns all instances that have any of multiple foreign key values', async () => {
    const pens = await productRepo.create({name: 'pens', categoryId: 1});
    const pencils = await productRepo.create({name: 'pencils', categoryId: 2});
    const paper = await productRepo.create({name: 'paper', categoryId: 3});
    const products = await findByForeignKeys(productRepo, 'categoryId', [1, 3]);
    expect(products).to.deepEqual([pens, paper]);
    expect(products).to.not.containDeep(pencils);
  });

  it('throws error if scope is passed in and is non-empty', async () => {
    await expect(
      findByForeignKeys(productRepo, 'categoryId', [1], {limit: 1}),
    ).to.be.rejectedWith('scope is not supported');
  });

  it('does not throw an error if scope is passed in and is undefined or empty', async () => {
    let products = await findByForeignKeys(
      productRepo,
      'categoryId',
      [1],
      undefined,
      {},
    );
    expect(products).to.be.empty();
    products = await findByForeignKeys(productRepo, 'categoryId', 1, {}, {});
    expect(products).to.be.empty();
  });
});
