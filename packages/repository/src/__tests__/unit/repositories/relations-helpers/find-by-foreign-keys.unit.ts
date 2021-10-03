// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  createStubInstance,
  expect,
  sinon,
  StubbedInstanceWithSinonAccessor,
} from '@loopback/testlab';
import {cloneDeep} from 'lodash';
import {findByForeignKeys} from '../../../..';
import {
  createProduct,
  Product,
  ProductRepository,
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

  it('checks if the custom scope is handled properly', async () => {
    const find = productRepo.stubs.find;
    find.resolves([]);
    await productRepo.create({id: 1, name: 'product', categoryId: 1});
    await productRepo.create({id: 2, name: 'product', categoryId: 1});
    await findByForeignKeys(productRepo, 'categoryId', 1, {
      where: {id: 2},
      include: ['nested inclusion'],
    });

    sinon.assert.calledWithMatch(find, {
      where: {
        categoryId: 1,
        id: 2,
      },
      include: ['nested inclusion'],
    });
  });

  it('does not manipulate non-primitive params', async () => {
    const fkValues = [1];
    const scope = {
      where: {id: 2},
    };
    const fkValuesOriginal = cloneDeep(fkValues);
    const scopeOriginal = cloneDeep(scope);

    productRepo.stubs.find.resolves([]);
    await productRepo.create({id: 1, name: 'product', categoryId: 1});
    await productRepo.create({id: 2, name: 'product', categoryId: 1});
    await findByForeignKeys(productRepo, 'categoryId', fkValues, scope);

    expect(fkValues).to.deepEqual(fkValuesOriginal);
    expect(scope).to.deepEqual(scopeOriginal);
  });

  it('runs a find for each fkValue to properly respect scope filters', async () => {
    const find = productRepo.stubs.find;
    const scope = {
      limit: 4,
      order: ['name ASC'],
      where: {name: {like: 'product%'}},
    };
    const newproducts = [
      createProduct({id: 1, name: 'productA', categoryId: 1}),
      createProduct({id: 2, name: 'productB', categoryId: 2}),
    ];
    await productRepo.create(newproducts[0]);
    await productRepo.create(newproducts[1]);
    find.resolves([]);
    await findByForeignKeys(productRepo, 'categoryId', [1, 2], scope);
    sinon.assert.calledWithMatch(find, {
      limit: 4,
      order: ['name ASC'],
      where: {
        categoryId: 1,
        name: {like: 'product%'},
      },
    });
    sinon.assert.calledWithMatch(find, {
      limit: 4,
      order: ['name ASC'],
      where: {
        categoryId: 2,
        name: {like: 'product%'},
      },
    });
  });
  it('runs find globally because totalLimit is set in scope', async () => {
    const find = productRepo.stubs.find;
    const scope = {
      totalLimit: 4,
      order: ['name ASC'],
      where: {name: {like: 'product%'}},
    };
    const newproducts = [
      createProduct({id: 1, name: 'productA', categoryId: 1}),
      createProduct({id: 2, name: 'productB', categoryId: 2}),
    ];
    await productRepo.create(newproducts[0]);
    await productRepo.create(newproducts[1]);
    find.resolves([]);
    await findByForeignKeys(productRepo, 'categoryId', [1, 2], scope);
    sinon.assert.calledWithMatch(find, {
      limit: 4,
      order: ['name ASC'],
      where: {
        categoryId: {inq: [1, 2]},
        name: {like: 'product%'},
      },
    });
  });
});
