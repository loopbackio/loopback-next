// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {DefaultCrudRepository} from '@loopback/repository';
import {DefaultModel} from '../models';
import {DbmemDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class DefaultModelRepository extends DefaultCrudRepository<
  DefaultModel,
  typeof DefaultModel.prototype.id
> {
  constructor(@inject('datasources.dbmem') dataSource: DbmemDataSource) {
    super(DefaultModel, dataSource);
  }
}
