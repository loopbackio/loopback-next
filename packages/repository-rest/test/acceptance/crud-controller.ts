// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/repository-rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  repository,
  CrudRepository,
  ValueObject,
  DataObject,
  Options,
  Where,
} from '@loopback/repository';
import {
  api,
  getControllerSpec,
  ControllerSpec,
  HttpErrors,
  put,
} from '@loopback/rest';
import {expect} from '@loopback/testlab';

import {CrudController} from '../..';

describe('CrudController', () => {
  class Address extends ValueObject {}

  @api({basePath: '/addresses', paths: {}})
  class AddressController extends CrudController<Address> {
    constructor(@repository('addressRepo') repo: CrudRepository<Address>) {
      super(repo);
    }
  }

  it('registers CRUD operations', () => {
    const spec = getControllerSpec(AddressController);
    const ops = getOperations(spec);
    expect(ops).to.eql([
      'get /: find',
      'post /: createAll',
      'post /updateAll: updateAll',
      'post /deleteAll: deleteAll',
      'get /count: count',
    ]);
  });
});

describe('CrudController with overrides', () => {
  class Address extends ValueObject {}

  @api({basePath: '/addresses', paths: {}})
  class AddressController extends CrudController<Address> {
    constructor(@repository('addressRepo') repo: CrudRepository<Address>) {
      super(repo);
    }

    /**
     * An example to add pre/post processing logic for the base method
     */
    async create(
      dataObject: DataObject<Address>,
      options?: Options,
    ): Promise<Address> {
      console.log('Creating address %j', dataObject);
      const address = await super.create(dataObject, options);
      console.log('Address created: %j', address);
      return address;
    }

    /**
     * An example to disable an HTTP route exposed by the base method
     */
    deleteAll() {
      // Disable the `deleteAll` route
      return Promise.reject(new HttpErrors.NotFound());
    }

    /**
     * An example to override `verb` and/or `path`
     */
    @put(`/updateAll`)
    updateAll(
      dataObject: DataObject<Address>,
      where?: Where,
      options?: Options,
    ): Promise<number> {
      return super.updateAll(dataObject, where, options);
    }
  }

  it('registers CRUD operations', () => {
    const spec = getControllerSpec(AddressController);
    const ops = getOperations(spec);
    expect(ops).to.eql([
      'get /: find',
      'post /: createAll',
      'put /updateAll: updateAll',
      'post /deleteAll: deleteAll',
      'get /count: count',
    ]);
  });
});

/**
 * Build an array of readable routes from the controller spec
 * @param spec Controller spec
 */
function getOperations(spec: ControllerSpec): string[] {
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
