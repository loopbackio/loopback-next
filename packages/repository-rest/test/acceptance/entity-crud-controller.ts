// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/repository-rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {EntityCrudController} from '../..';
import {Entity, repository, EntityCrudRepository} from '@loopback/repository';
import {api, getControllerSpec, ControllerSpec} from '@loopback/rest';
import {expect} from '@loopback/testlab';

describe('EntityCrudController', () => {
  class Customer extends Entity {}

  @api({basePath: '/customers', paths: {}})
  class CustomerController extends EntityCrudController<Customer, string> {
    constructor(
      @repository('customerRepo') repo: EntityCrudRepository<Customer, string>,
    ) {
      super(repo);
    }
  }

  it('registers CRUD operations', () => {
    const spec = getControllerSpec(CustomerController);
    expect(spec.basePath).to.equal('/customers');
    const ops = getOperations(spec);
    expect(ops).to.eql([
      'get /: find',
      'post /: createAll',
      'post /updateAll: updateAll',
      'post /deleteAll: deleteAll',
      'get /count: count',
      'put /save: save',
      'post /update: update',
      'post /delete: delete',
      'get /{id}: findById',
      'patch /{id}: updateById',
      'put /{id}: replaceById',
      'delete {id}: deleteById',
      'get /{id}/exists: exists',
    ]);
  });

  function getOperations(spec: ControllerSpec) {
    const operations: string[] = [];
    for (const p in spec.paths) {
      const path = spec.paths[p];
      let verb, operationName;
      for (const v of [
        'delete',
        'get',
        'head',
        'options',
        'patch',
        'post',
        'put',
      ]) {
        if (v in path) {
          verb = v;
          operationName = path[v]['x-operation-name'];
          operations.push(`${verb} ${p}: ${operationName}`);
        }
      }
    }
    return operations;
  }
});
