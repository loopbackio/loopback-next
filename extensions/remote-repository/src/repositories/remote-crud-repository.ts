// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/remote-repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  AnyObject,
  Command,
  Count,
  DataObject,
  Entity,
  EntityCrudRepository,
  Filter,
  FilterExcludingWhere,
  InclusionResolver,
  juggler,
  PositionalParameters,
  rejectNavigationalPropertiesInData,
  Where,
} from '@loopback/repository';
import assert from 'assert';
import debugFactory from 'debug';

const debug = debugFactory('loopback:remote-repository:crud');

/**
 * A repository class for accessing models persisted by a remote LoopBack
 * application.
 */
export class RemoteCrudRepository<
  T extends Entity,
  ID,
  Relations extends object = {}
> implements EntityCrudRepository<T, ID, Relations> {
  inclusionResolvers: Map<string, InclusionResolver<T, Entity>>;

  /**
   * @param entityClass - LoopBack 4 entity class
   * @param dataSource - Legacy juggler data source. The datasource must be
   * backed by OpenAPI connector and configured to use named (not positional)
   * parameters.
   */
  constructor(
    // entityClass should have type "typeof T", but that's not supported by TSC
    public entityClass: typeof Entity & {prototype: T},
    public dataSource: juggler.DataSource,
  ) {
    const definition = entityClass.definition;
    assert(
      !!definition,
      `Entity ${entityClass.name} must have valid model definition.`,
    );
    assert(
      definition.idProperties().length > 0,
      `Entity ${entityClass.name} must have at least one id/pk property.`,
    );
  }

  async save(
    entity: DataObject<T>,
    options?: AnyObject | undefined,
  ): Promise<T> {
    throw new Error('RemoteCrudRepository.save() is not implemented yet.');
  }

  async update(
    entity: DataObject<T>,
    options?: AnyObject | undefined,
  ): Promise<void> {
    throw new Error('RemoteCrudRepository.update() is not implemented yet.');
  }

  async delete(
    entity: DataObject<T>,
    options?: AnyObject | undefined,
  ): Promise<void> {
    throw new Error('RemoteCrudRepository.delete() is not implemented yet.');
  }

  async findById(
    id: ID,
    filter?: FilterExcludingWhere<T>,
    options?: AnyObject | undefined,
  ): Promise<T & Relations> {
    throw new Error('RemoteCrudRepository.findById() is not implemented yet.');
  }

  async updateById(
    id: ID,
    data: DataObject<T>,
    options?: AnyObject | undefined,
  ): Promise<void> {
    throw new Error(
      'RemoteCrudRepository.updateById() is not implemented yet.',
    );
  }

  async replaceById(
    id: ID,
    data: DataObject<T>,
    options?: AnyObject | undefined,
  ): Promise<void> {
    throw new Error(
      'RemoteCrudRepository.replaceById() is not implemented yet.',
    );
  }

  async deleteById(id: ID, options?: AnyObject | undefined): Promise<void> {
    throw new Error(
      'RemoteCrudRepository.deleteByID() is not implemented yet.',
    );
  }

  async exists(id: ID, options?: AnyObject | undefined): Promise<boolean> {
    throw new Error('RemoteCrudRepository.exists() is not implemented yet.');
  }

  async execute(
    command: Command,
    parameters: AnyObject | PositionalParameters,
    options?: AnyObject | undefined,
  ): Promise<AnyObject> {
    throw new Error('RemoteCrudRepository.execute() is not implemented.');
  }

  async create(
    dataObject: DataObject<T>,
    options?: AnyObject | undefined,
  ): Promise<T> {
    const data = this.entityToData(dataObject);
    const response = await this.executeModelMethod('create', {data});
    return this.toEntity(response.obj);
  }

  async createAll(
    dataObjects: DataObject<T>[],
    options?: AnyObject | undefined,
  ): Promise<T[]> {
    throw new Error('RemoteCrudRepository.createAll() is not implemented yet.');
  }

  async find(
    filter?: Filter<T> | undefined,
    options?: AnyObject | undefined,
  ): Promise<(T & Relations)[]> {
    const response = await this.executeModelMethod('find', {
      // A workaround for a bug in swagger-client
      // TypeError: Cannot read property 'skipEncoding' of undefined
      //   at swagger-client/dist/index.js:732:37
      filter: filter ?? {},
    });
    return this.toEntities(response.obj);
  }

  async updateAll(
    dataObject: DataObject<T>,
    where?: Where<T>,
    options?: AnyObject | undefined,
  ): Promise<Count> {
    throw new Error('RemoteCrudRepository.updateAll() is not implemented yet.');
  }

  async deleteAll(
    where?: Where<T>,
    options?: AnyObject | undefined,
  ): Promise<Count> {
    throw new Error('RemoteCrudRepository.deleteAll() is not implemented yet.');
  }

  async count(
    where?: Where<T>,
    options?: AnyObject | undefined,
  ): Promise<Count> {
    throw new Error('RemoteCrudRepository.count() is not implemented yet.');
  }

  //
  // IMPLEMENTATION HELPERS
  //

  protected async getService() {
    await this.dataSource.connect();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.dataSource.DataAccessObject as any;
  }

  protected getEndpointName(controllerMethodName: string) {
    return `${this.entityClass.modelName}Controller_${controllerMethodName}`;
  }

  protected toEntity<R extends T>(data: object): R {
    return new this.entityClass(data) as R;
  }

  protected toEntities<R extends T>(data: object[]): R[] {
    return data.map(m => this.toEntity<R>(m));
  }

  protected entityToData<R extends T>(
    instanceOrData: R | DataObject<R>,
    options = {},
  ): object {
    // Important: swagger-client is not able to convert our Model/Entity
    // instances to JSON, we have to call `toJSON()` before passing the data
    // object to the client
    const data =
      typeof instanceOrData.toJSON === 'function'
        ? instanceOrData.toJSON()
        : instanceOrData;

    rejectNavigationalPropertiesInData(this.entityClass, data);
    return data;
  }

  protected async executeModelMethod(modelMethodName: string, params: object) {
    const endpointName = this.getEndpointName(modelMethodName);
    return this.executeEndpoint(endpointName, params);
  }

  protected async executeEndpoint(endpointName: string, params: AnyObject) {
    const requestOptions: OpenApiRequestOptions = {};

    // A short-term hack to convert "data" parameter into request body
    // TODO: use OpenAPI spec to decide which parameter is for request body
    // Also note we need a different mechanism for Swagger servers (LB 3.x)
    if ('data' in params) {
      requestOptions.requestBody = params.data;
      params = {...params};
      delete params.data;
    }

    const service = await this.getService();

    // TODO: throw a helpful error when the endpoint does not exist
    // E.g. HTTP 501 Not Implemented + a helpful description

    // TODO: verify that the endpoint accepts all fields provided in `params`
    // object. Nice to have: also check that the param schema is matching
    // our expectations

    try {
      debug(
        'Invoking endpoint %s with params %o and requestOptions %o',
        endpointName,
        params,
        requestOptions,
      );
      // we must await the response, otherwise the catch handler will be ignored!
      const result = await service[endpointName](params, requestOptions);
      debug('%s responded with %o', result);
      return result;
    } catch (err) {
      debug('Endpoint %s failed with', endpointName, err);
      const serverError = err?.response?.body?.error;
      if (typeof serverError === 'object') {
        debug('Detected server error %o', serverError);
        err.details = serverError.details;
        err.cause = serverError;
      }
      throw err;
    }
  }
}

interface OpenApiRequestOptions {
  requestBody?: object | object[] | string;
  serverVariables?: AnyObject;
}
