// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/loopback-next-hello-world
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {juggler, DefaultCrudRepository} from '../../../..';
import {Product} from '../models/product.model';
export {Product};

export class ProductRepository extends DefaultCrudRepository<
  Product,
  typeof Product.prototype.id
> {
  constructor(dataSource: juggler.DataSource) {
    super(Product, dataSource);
  }
}
