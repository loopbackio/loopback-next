// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  belongsTo,
  BelongsToAccessor,
  DefaultCrudRepository,
  Entity,
  Getter,
  hasMany,
  HasManyRepositoryFactory,
  hasOne,
  HasOneRepositoryFactory,
  juggler,
  model,
  property,
} from '../../../..';

@model()
export class Manufacturer extends Entity {
  @property({id: true})
  id: number;
  @property()
  name: string;
  @belongsTo(() => Product)
  productId: number;

  constructor(data: Partial<Manufacturer>) {
    super(data);
  }
}
interface ManufacturerRelations {
  products?: ProductWithRelations;
}
type ManufacturerWithRelations = Manufacturer & ManufacturerRelations;

export class ManufacturerRepository extends DefaultCrudRepository<
  Manufacturer,
  typeof Manufacturer.prototype.id,
  ManufacturerRelations
> {
  public readonly product: BelongsToAccessor<
    Product,
    typeof Manufacturer.prototype.id
  >;
  constructor(
    dataSource: juggler.DataSource,
    productRepository?: Getter<ProductRepository>,
  ) {
    super(Manufacturer, dataSource);
    if (productRepository)
      this.product = this.createBelongsToAccessorFor(
        'product',
        productRepository,
      );
  }
}

@model()
export class Product extends Entity {
  @property({id: true})
  id: number;
  @property()
  name: string;
  @hasOne(() => Manufacturer)
  manufacturer: Manufacturer;
  @belongsTo(() => Category)
  categoryId: number;

  constructor(data: Partial<Product>) {
    super(data);
  }
}
interface ProductRelations {
  manufacturer?: ManufacturerRelations;
}

type ProductWithRelations = Product & ProductRelations;

export class ProductRepository extends DefaultCrudRepository<
  Product,
  typeof Product.prototype.id,
  ProductRelations
> {
  public readonly category: BelongsToAccessor<
    Category,
    typeof Product.prototype.id
  >;
  public readonly manufacturer: HasOneRepositoryFactory<
    Manufacturer,
    typeof Product.prototype.id
  >;
  constructor(
    dataSource: juggler.DataSource,
    categoryRepository?: Getter<CategoryRepository>,
    manufacturerRepository?: Getter<ManufacturerRepository>,
  ) {
    super(Product, dataSource);
    if (categoryRepository)
      this.category = this.createBelongsToAccessorFor(
        'category',
        categoryRepository,
      );
    if (manufacturerRepository)
      this.manufacturer = this.createHasOneRepositoryFactoryFor(
        'manufacturer',
        manufacturerRepository,
      );
  }
}

@model()
export class Category extends Entity {
  @property({id: true})
  id?: number;
  @property()
  name: string;
  @hasMany(() => Product, {keyTo: 'categoryId'})
  products?: Product[];
  constructor(data: Partial<Category>) {
    super(data);
  }
}
interface CategoryRelations {
  products?: ProductWithRelations;
}
type CategoryWithRelations = Category & CategoryRelations;

export class CategoryRepository extends DefaultCrudRepository<
  Category,
  typeof Category.prototype.id,
  CategoryRelations
> {
  public readonly products: HasManyRepositoryFactory<
    Product,
    typeof Category.prototype.id
  >;
  constructor(
    dataSource: juggler.DataSource,
    productRepository: Getter<ProductRepository>,
  ) {
    super(Category, dataSource);
    this.products = this.createHasManyRepositoryFactoryFor(
      'products',
      productRepository,
    );
  }
}

export const testdb: juggler.DataSource = new juggler.DataSource({
  name: 'db',
  connector: 'memory',
});

export function createCategory(properties: Partial<Category>) {
  return new Category(properties);
}

export function createProduct(properties: Partial<Product>) {
  return new Product(properties);
}

export function createManufacturer(properties: Partial<Manufacturer>) {
  return new Manufacturer(properties);
}
