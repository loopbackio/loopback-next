// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect, toJSON} from '@loopback/testlab';
import {includeRelatedModels, InclusionResolver} from '../../../..';
import {
  Category,
  CategoryRepository,
  Product,
  ProductRepository,
  testdb,
} from './relations-helpers-fixtures';

describe('includeRelatedModels', () => {
  let productRepo: ProductRepository;
  let categoryRepo: CategoryRepository;

  before(() => {
    productRepo = new ProductRepository(testdb);
    categoryRepo = new CategoryRepository(testdb, async () => productRepo);
  });

  beforeEach(async () => {
    await productRepo.deleteAll();
    await categoryRepo.deleteAll();
  });

  it("defines a repository's inclusionResolvers property", () => {
    expect(categoryRepo.inclusionResolvers).to.not.be.undefined();
    expect(productRepo.inclusionResolvers).to.not.be.undefined();
  });

  it('returns source model if no filter is passed in', async () => {
    const category = await categoryRepo.create({name: 'category 1'});
    await categoryRepo.create({name: 'category 2'});
    const result = await includeRelatedModels(categoryRepo, [category]);
    expect(result).to.eql([category]);
  });

  it('throws error if the target repository does not have the registered resolver', async () => {
    const category = await categoryRepo.create({name: 'category 1'});
    await expect(
      includeRelatedModels(categoryRepo, [category], [{relation: 'products'}]),
    ).to.be.rejectedWith(
      /Invalid "filter.include" entries: {"relation":"products"}/,
    );
  });

  it('returns an empty array if target model of the source entity does not have any matched instances', async () => {
    const category = await categoryRepo.create({name: 'category'});

    categoryRepo.inclusionResolvers.set('products', hasManyResolver);

    const categories = await includeRelatedModels(
      categoryRepo,
      [category],
      [{relation: 'products'}],
    );

    expect(categories[0].products).to.be.empty();
  });

  it('includes related model for one instance - belongsTo', async () => {
    const category = await categoryRepo.create({name: 'category'});
    const product = await productRepo.create({
      name: 'product',
      categoryId: category.id,
    });

    productRepo.inclusionResolvers.set('category', belongsToResolver);

    const productWithCategories = await includeRelatedModels(
      productRepo,
      [product],
      [{relation: 'category'}],
    );

    expect(productWithCategories[0].toJSON()).to.deepEqual({
      ...product.toJSON(),
      category: category.toJSON(),
    });
  });

  it('includes related model for more than one instance - belongsTo', async () => {
    const categoryOne = await categoryRepo.create({name: 'category 1'});
    const productOne = await productRepo.create({
      name: 'product 1',
      categoryId: categoryOne.id,
    });

    const categoryTwo = await categoryRepo.create({name: 'category 2'});
    const productTwo = await productRepo.create({
      name: 'product 2',
      categoryId: categoryTwo.id,
    });

    const productThree = await productRepo.create({
      name: 'product 3',
      categoryId: categoryTwo.id,
    });

    productRepo.inclusionResolvers.set('category', belongsToResolver);

    const productWithCategories = await includeRelatedModels(
      productRepo,
      [productOne, productTwo, productThree],
      [{relation: 'category'}],
    );

    expect(toJSON(productWithCategories)).to.deepEqual([
      {...productOne.toJSON(), category: categoryOne.toJSON()},
      {...productTwo.toJSON(), category: categoryTwo.toJSON()},
      {...productThree.toJSON(), category: categoryTwo.toJSON()},
    ]);
  });

  it('includes related models for one instance - hasMany', async () => {
    const category = await categoryRepo.create({name: 'category'});
    const productOne = await productRepo.create({
      name: 'product 1',
      categoryId: category.id,
    });

    const productTwo = await productRepo.create({
      name: 'product 2',
      categoryId: category.id,
    });

    categoryRepo.inclusionResolvers.set('products', hasManyResolver);

    const categoryWithProducts = await includeRelatedModels(
      categoryRepo,
      [category],
      [{relation: 'products'}],
    );

    expect(toJSON(categoryWithProducts)).to.deepEqual([
      {
        ...category.toJSON(),
        products: [productOne.toJSON(), productTwo.toJSON()],
      },
    ]);
  });

  it('includes related models for more than one instance - hasMany', async () => {
    const categoryOne = await categoryRepo.create({name: 'category 1'});
    const productOne = await productRepo.create({
      name: 'product 1',
      categoryId: categoryOne.id,
    });

    const categoryTwo = await categoryRepo.create({name: 'category 2'});
    const productTwo = await productRepo.create({
      name: 'product 2',
      categoryId: categoryTwo.id,
    });

    const categoryThree = await categoryRepo.create({name: 'category 3'});
    const productThree = await productRepo.create({
      name: 'product 3',
      categoryId: categoryTwo.id,
    });

    categoryRepo.inclusionResolvers.set('products', hasManyResolver);

    const categoryWithProducts = await includeRelatedModels(
      categoryRepo,
      [categoryOne, categoryTwo, categoryThree],
      [{relation: 'products'}],
    );

    expect(toJSON(categoryWithProducts)).to.deepEqual([
      {...categoryOne.toJSON(), products: [productOne.toJSON()]},
      {
        ...categoryTwo.toJSON(),
        products: [productTwo.toJSON(), productThree.toJSON()],
      },
      {...categoryThree.toJSON(), products: []},
    ]);
  });

  // stubbed resolvers

  const belongsToResolver: InclusionResolver<
    Product,
    Category
  > = async entities => {
    const categories = [];

    for (const product of entities) {
      const category = await categoryRepo.findById(product.categoryId);
      categories.push(category);
    }

    return categories;
  };

  const hasManyResolver: InclusionResolver<
    Category,
    Product
  > = async entities => {
    const products = [];

    for (const category of entities) {
      const product = await categoryRepo.products(category.id).find();
      products.push(product);
    }
    return products;
  };
});
