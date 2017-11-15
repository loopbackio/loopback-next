// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/repository-rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  CrudRepository,
  ValueObject,
  Entity,
  DataObject,
  Options,
  Filter,
  Where,
} from '@loopback/repository';

import {post, get, param, requestBody} from '@loopback/rest';

/**
 * Base controller class to expose CrudRepository operations to REST
 */
export abstract class CrudController<T extends ValueObject | Entity> {
  constructor(protected repository: CrudRepository<T>) {}

  @post(`/`)
  create(
    @requestBody() dataObject: DataObject<T>,
    @param({name: 'options', required: false, in: 'query'}) options?: Options,
  ): Promise<T> {
    return this.repository.create(dataObject, options);
  }

  @post(`/`)
  createAll(
    @requestBody() dataObjects: DataObject<T>[],
    @param({name: 'options', required: false, in: 'query'}) options?: Options,
  ): Promise<T[]> {
    return this.repository.createAll(dataObjects, options);
  }

  @get(`/`)
  find(
    @param({name: 'filter', required: false, in: 'query'}) filter?: Filter,
    @param({name: 'options', required: false, in: 'query'}) options?: Options,
  ): Promise<T[]> {
    return this.repository.find(filter, options);
  }

  @post(`/updateAll`)
  updateAll(
    @requestBody() dataObject: DataObject<T>,
    @param({name: 'where', required: false, in: 'query'}) where?: Where,
    @param({name: 'options', required: false, in: 'query'}) options?: Options,
  ): Promise<number> {
    return this.repository.updateAll(dataObject, where, options);
  }

  @post(`/deleteAll`)
  deleteAll(
    @param({name: 'where', required: false, in: 'query'}) where?: Where,
    @param({name: 'options', required: false, in: 'query'}) options?: Options,
  ): Promise<number> {
    return this.repository.deleteAll(where, options);
  }

  @get(`/count`)
  count(
    @param({name: 'where', required: false, in: 'query'}) where?: Where,
    @param({name: 'options', required: false, in: 'query'}) options?: Options,
  ): Promise<number> {
    return this.repository.count(where, options);
  }
}
