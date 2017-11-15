// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/repository-rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Entity,
  DataObject,
  Options,
  Filter,
  EntityCrudRepository,
} from '@loopback/repository';

import {post, put, patch, get, del, param, requestBody} from '@loopback/rest';

import {CrudController} from './crud-controller';

/**
 * Base controller class to expose CrudRepository operations to REST
 */
export abstract class EntityCrudController<
  T extends Entity,
  ID
> extends CrudController<T> {
  constructor(protected repository: EntityCrudRepository<T, ID>) {
    super(repository);
  }

  @put(`/save`)
  save(
    @requestBody() entity: DataObject<T>,
    @param({name: 'options', required: false, in: 'query'}) options?: Options,
  ): Promise<T | null> {
    return this.repository.save(entity, options);
  }

  @post(`/update`, {
    responses: {
      '200': {
        description: 'The instance is updated successfully',
        schema: {type: 'boolean'},
      },
    },
  })
  update(
    @requestBody() entity: DataObject<T>,
    @param({name: 'options', required: false, in: 'query'}) options?: Options,
  ): Promise<boolean> {
    return this.repository.update(entity, options);
  }

  @post(`/delete`, {
    responses: {
      '200': {
        description: 'The instance is deleted successfully',
        schema: {type: 'boolean'},
      },
    },
  })
  delete(
    @requestBody() entity: DataObject<T>,
    @param({name: 'options', required: false, in: 'query'}) options?: Options,
  ): Promise<boolean> {
    return this.repository.update(entity, options);
  }

  @get(`/{id}`)
  findById(
    @param({name: 'id', in: 'path', schema: {type: 'string'}}) id: ID,
    @param({name: 'filter', required: false, in: 'query'}) filter?: Filter,
    @param({name: 'options', required: false, in: 'query'}) options?: Options,
  ): Promise<T> {
    return this.repository.findById(id, filter, options);
  }

  @patch(`/{id}`, {
    responses: {
      '200': {
        description: 'The instance is updated successfully',
        schema: {type: 'boolean'},
      },
    },
  })
  updateById(
    @param({name: 'id', in: 'path'}) id: ID,
    @requestBody() data: DataObject<T>,
    @param({name: 'options', required: false, in: 'query'}) options?: Options,
  ): Promise<boolean> {
    return this.repository.updateById(id, data, options);
  }

  @put(`/{id}`, {
    responses: {
      '200': {
        description: 'The instance is replaced successfully',
        schema: {type: 'boolean'},
      },
    },
  })
  replaceById(
    @param({name: 'id', in: 'path'}) id: ID,
    @requestBody() data: DataObject<T>,
    @param({name: 'options', required: false, in: 'query'}) options?: Options,
  ): Promise<boolean> {
    return this.repository.replaceById(id, data, options);
  }

  @del(`{id}`, {
    responses: {
      '200': {
        description: 'The instance is deleted successfully',
        schema: {type: 'boolean'},
      },
    },
  })
  deleteById(
    @param({name: 'id', in: 'path'}) id: ID,
    @param({name: 'options', required: false, in: 'query'}) options?: Options,
  ): Promise<boolean> {
    return this.repository.deleteById(id, options);
  }

  @get(`/{id}/exists`, {
    responses: {
      '200': {
        description: 'The id exists for an instance',
        schema: {type: 'boolean'},
      },
    },
  })
  exists(
    @param({name: 'id', in: 'path', schema: {type: 'string'}}) id: ID,
    @param({name: 'options', required: false, in: 'query'}) options?: Options,
  ): Promise<boolean> {
    return this.repository.exists(id, options);
  }
}
