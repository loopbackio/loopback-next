// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  expect,
  createStubInstance,
  sinon,
  StubbedInstanceWithSinonAccessor,
} from '@loopback/testlab';
import {findByForeignKeys} from '../../../..';
import {
  ProductRepository,
  Product,
  createProduct,
} from './relations-helpers-fixtures';

describe('findByForeignKeys', () => {
  let productRepo: StubbedInstanceWithSinonAccessor<ProductRepository>;

  // use beforeEach to restore sinon stub
  beforeEach(() => {
    productRepo = createStubInstance(ProductRepository);
  });

  it('returns an empty array when no foreign keys are passed in', async () => {
    const RESULTS: Product[] = [];
    productRepo.stubs.find.resolves(RESULTS);

    const fkIds: number[] = [];
    await productRepo.create({id: 1, name: 'product', categoryId: 1});
    const products = await findByForeignKeys(productRepo, 'categoryId', fkIds);
    expect(products).to.be.empty();

    sinon.assert.notCalled(productRepo.stubs.find);
  });

  it('returns an empty array when no instances have the foreign key value', async () => {
    const find = productRepo.stubs.find;
    find.resolves([]);
    await productRepo.create({id: 1, name: 'product', categoryId: 1});
    const products = await findByForeignKeys(productRepo, 'categoryId', 2);
    expect(products).to.be.empty();
    sinon.assert.calledWithMatch(find, {});
  });

  it('returns an empty array when no instances have the foreign key values', async () => {
    const find = productRepo.stubs.find;
    find.resolves([]);
    await productRepo.create({id: 1, name: 'product', categoryId: 1});
    const products = await findByForeignKeys(productRepo, 'categoryId', [2, 3]);
    expect(products).to.be.empty();
    sinon.assert.calledWithMatch(find, {});
  });

  it('returns all instances that have the foreign key value', async () => {
    const find = productRepo.stubs.find;
    const pen = createProduct({name: 'pen', categoryId: 1});
    const pencil = createProduct({name: 'pencil', categoryId: 1});
    find.resolves([pen, pencil]);

    const products = await findByForeignKeys(productRepo, 'categoryId', 1);
    expect(products).to.deepEqual([pen, pencil]);

    sinon.assert.calledWithMatch(find, {
      where: {
        categoryId: 1,
      },
    });
  });

  it('does not include instances with different foreign key values', async () => {
    const find = productRepo.stubs.find;
    const pen = await productRepo.create({name: 'pen', categoryId: 1});
    const pencil = await productRepo.create({name: 'pencil', categoryId: 2});
    find.resolves([pen]);
    const products = await findByForeignKeys(productRepo, 'categoryId', 1);
    expect(products).to.deepEqual([pen]);
    expect(products).to.not.containDeep(pencil);
    sinon.assert.calledWithMatch(find, {
      where: {
        categoryId: 1,
      },
    });
  });

  it('includes instances when there is one value in the array of foreign key values', async () => {
    const find = productRepo.stubs.find;
    const pen = await productRepo.create({name: 'pen', categoryId: 1});
    const pencil = await productRepo.create({name: 'pencil', categoryId: 2});
    find.resolves([pencil]);
    const products = await findByForeignKeys(productRepo, 'categoryId', [2]);
    expect(products).to.deepEqual([pencil]);
    expect(products).to.not.containDeep(pen);
    sinon.assert.calledWithMatch(find, {
      where: {
        categoryId: 2,
      },
    });
  });

  it('returns all instances that have any of multiple foreign key values', async () => {
    const pen = createProduct({name: 'pen', categoryId: 1});
    const pencil = createProduct({name: 'pencil', categoryId: 2});
    const paper = createProduct({name: 'paper', categoryId: 3});
    const find = productRepo.stubs.find;
    find.resolves([pen, paper]);
    const products = await findByForeignKeys(productRepo, 'categoryId', [1, 3]);
    expect(products).to.deepEqual([pen, paper]);
    expect(products).to.not.containDeep(pencil);
    sinon.assert.calledWithMatch(find, {
      where: {
        categoryId: {
          inq: [1, 3],
        },
      },
    });
  });

  // update the test when scope is supported
  it('throws error if scope is passed in and is non-empty', async () => {
    productRepo.stubs.find.resolves([]);
    await expect(
      findByForeignKeys(productRepo, 'categoryId', [1], {limit: 1}),
    ).to.be.rejectedWith('scope is not supported');
    sinon.assert.notCalled(productRepo.stubs.find);
  });

  // update the test when scope is supported
  it('does not throw an error if scope is passed in and is undefined or empty', async () => {
    const find = productRepo.stubs.find;
    find.resolves([]);
    let products = await findByForeignKeys(
      productRepo,
      'categoryId',
      [1],
      undefined,
      {},
    );
    expect(products).to.be.empty();
    sinon.assert.calledWithMatch(find, {});
    products = await findByForeignKeys(productRepo, 'categoryId', 1, {}, {});
    expect(products).to.be.empty();
    sinon.assert.calledWithMatch(find, {});
  });
});
