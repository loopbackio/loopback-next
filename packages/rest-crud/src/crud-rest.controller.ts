// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest-crud
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Count,
  CountSchema,
  DataObject,
  Entity,
  EntityCrudRepository,
  Filter,
  Where,
} from '@loopback/repository';
import {
  api,
  del,
  get,
  getFilterSchemaFor,
  getJsonSchema,
  getModelSchemaRef,
  getWhereSchemaFor,
  JsonSchemaOptions,
  jsonToSchemaObject,
  MediaTypeObject,
  param,
  ParameterObject,
  patch,
  post,
  put,
  requestBody,
  ResponsesObject,
  SchemaObject,
} from '@loopback/rest';
import assert = require('assert');

// Ideally, this file should simply `export class CrudRestController<...>{}`
// Unfortunately, that's not possible for several reasons.
//
// First of all, to correctly decorate methods and define schemas for request
// and response bodies, we need to know the target model which will be used by
// the controller. As a result, this file has to export a function that will
// create a constructor class specific to the given model.
//
// Secondly, TypeScript does not allow decorators to be used in class
// expressions - see https://github.com/microsoft/TypeScript/issues/7342.
// As a result, we cannot write implement the factory as `return class ...`,
// but have to define the class as an internal type and return the controller
// constructor in a new statement.
// Because the controller class is an internal type scoped to the body of the
// factory function, we cannot use it to describe the return type. We must
// explicitly provide the return type.
//
// To work around those issues, we use the following design:
// - The interface `CrudRestController` describes controller methods (members)
// - The type `CrudRestControllerCtor` describes the class constructor.
// - `defineCrudRestController` returns `CrudRestControllerCtor` type.

/**
 * This interface describes prototype members of the controller class
 * returned by `defineCrudRestController`.
 */
export interface CrudRestController<
  T extends Entity,
  IdType,
  IdName extends keyof T,
  Relations extends object = {}
> {
  /**
   * The backing repository used to access & modify model data.
   */
  readonly repository: EntityCrudRepository<T, IdType>;

  /**
   * Implementation of the endpoint `POST /`.
   * @param data Model data
   */
  create(data: Omit<T, IdName>): Promise<T>;
}

/**
 * Constructor of the controller class returned by `defineCrudRestController`.
 */
export interface CrudRestControllerCtor<
  T extends Entity,
  IdType,
  IdName extends keyof T,
  Relations extends object = {}
> {
  new (
    repository: EntityCrudRepository<T, IdType, Relations>,
  ): CrudRestController<T, IdType, IdName, Relations>;
}

/**
 * Options to configure different aspects of a CRUD REST Controller.
 */
export interface CrudRestControllerOptions {
  /**
   * The base path where to "mount" the controller.
   */
  basePath: string;
}

/**
 * Create (define) a CRUD Controller class for the given model.
 *
 * Example usage:
 *
 * ```ts
 * const ProductController = defineCrudRestController<
 * Product,
 * typeof Product.prototype.id,
 * 'id'
 * >(Product, {basePath: '/products'});
 *
 * inject('repositories.ProductRepository')(
 *  ProductController,
 *   undefined,
 *   0,
 * );
 *
 * app.controller(ProductController);
 * ```
 *
 * @param modelCtor A model class, e.g. `Product`.
 * @param options Configuration options, e.g. `{basePath: '/products'}`.
 */
export function defineCrudRestController<
  T extends Entity,
  IdType,
  IdName extends keyof T,
  Relations extends object = {}
>(
  modelCtor: typeof Entity & {prototype: T & {[key in IdName]: IdType}},
  options: CrudRestControllerOptions,
): CrudRestControllerCtor<T, IdType, IdName, Relations> {
  const modelName = modelCtor.name;
  const idPathParam: ParameterObject = {
    name: 'id',
    in: 'path',
    schema: getIdSchema(modelCtor),
  };

  @api({basePath: options.basePath, paths: {}})
  class CrudRestControllerImpl
    implements CrudRestController<T, IdType, IdName> {
    constructor(
      public readonly repository: EntityCrudRepository<T, IdType, Relations>,
    ) {}

    @post('/', {
      ...response.model(200, `${modelName} instance created`, modelCtor),
    })
    async create(
      @body(modelCtor, {
        title: `New${modelName}`,
        exclude: modelCtor.getIdProperties() as (keyof T)[],
      })
      data: Omit<T, IdName>,
    ): Promise<T> {
      return this.repository.create(
        // FIXME(bajtos) Improve repository API to support this use case
        // with no explicit type-casts required
        data as DataObject<T>,
      );
    }

    @get('/', {
      ...response.array(200, `Array of ${modelName} instances`, modelCtor, {
        includeRelations: true,
      }),
    })
    async find(
      @param.query.object('filter', getFilterSchemaFor(modelCtor))
      filter?: Filter<T>,
    ): Promise<(T & Relations)[]> {
      return this.repository.find(filter);
    }

    @get('/{id}', {
      ...response.model(200, `${modelName} instance`, modelCtor, {
        includeRelations: true,
      }),
    })
    async findById(
      @param(idPathParam) id: IdType,
      @param.query.object('filter', getFilterSchemaFor(modelCtor))
      filter?: Filter<T>,
    ): Promise<T & Relations> {
      return this.repository.findById(id, filter);
    }

    @get('/count', {
      ...response(200, `${modelName} count`, {schema: CountSchema}),
    })
    async count(
      @param.query.object('where', getWhereSchemaFor(modelCtor))
      where?: Where<T>,
    ): Promise<Count> {
      return this.repository.count(where);
    }

    @patch('/', {
      ...response(200, `Count of ${modelName} models updated`, {
        schema: CountSchema,
      }),
    })
    async updateAll(
      @body(modelCtor, {partial: true}) data: Partial<T>,
      @param.query.object('where', getWhereSchemaFor(modelCtor))
      where?: Where<T>,
    ): Promise<Count> {
      return this.repository.updateAll(
        // FIXME(bajtos) Improve repository API to support this use case
        // with no explicit type-casts required
        data as DataObject<T>,
        where,
      );
    }

    @patch('/{id}', {
      responses: {
        '204': {description: `${modelName} was updated`},
      },
    })
    async updateById(
      @param(idPathParam) id: IdType,
      @body(modelCtor, {partial: true}) data: Partial<T>,
    ): Promise<void> {
      await this.repository.updateById(
        id,
        // FIXME(bajtos) Improve repository API to support this use case
        // with no explicit type-casts required
        data as DataObject<T>,
      );
    }

    @put('/{id}', {
      responses: {
        '204': {description: `${modelName} was updated`},
      },
    })
    async replaceById(
      @param(idPathParam) id: IdType,
      @body(modelCtor) data: T,
    ): Promise<void> {
      await this.repository.replaceById(id, data);
    }

    @del('/{id}', {
      responses: {
        '204': {description: `${modelName} was deleted`},
      },
    })
    async deleteById(@param(idPathParam) id: IdType): Promise<void> {
      await this.repository.deleteById(id);
    }
  }

  const controllerName = modelName + 'Controller';
  const defineNamedController = new Function(
    'controllerClass',
    `return class ${controllerName} extends controllerClass {}`,
  );
  const controller = defineNamedController(CrudRestControllerImpl);
  assert.equal(controller.name, controllerName);
  return controller;
}

function getIdSchema<T extends Entity>(
  modelCtor: typeof Entity & {prototype: T},
): SchemaObject {
  const idProp = modelCtor.getIdProperties()[0];
  const modelSchema = jsonToSchemaObject(
    getJsonSchema(modelCtor),
  ) as SchemaObject;
  return (modelSchema.properties || {})[idProp] as SchemaObject;
}

// Temporary implementation of a short-hand version of `@requestBody`
// See https://github.com/strongloop/loopback-next/issues/3493
function body<T extends Entity>(
  modelCtor: Function & {prototype: T},
  options?: JsonSchemaOptions<T>,
) {
  return requestBody({
    content: {
      'application/json': {
        schema: getModelSchemaRef(modelCtor, options),
      },
    },
  });
}

// Temporary workaround for a missing `@response` decorator
// See https://github.com/strongloop/loopback-next/issues/1672
// Please note this is just a workaround, the real helper should be implemented
// as a decorator that contributes OpenAPI metadata in a way that allows
// `@post` to merge the responses with the metadata provided at operation level
function response(
  statusCode: number,
  description: string,
  payload: MediaTypeObject,
): {responses: ResponsesObject} {
  return {
    responses: {
      [`${statusCode}`]: {
        description,
        content: {
          'application/json': payload,
        },
      },
    },
  };
}

namespace response {
  export function model<T extends Entity>(
    statusCode: number,
    description: string,
    modelCtor: Function & {prototype: T},
    options?: JsonSchemaOptions<T>,
  ) {
    return response(statusCode, description, {
      schema: getModelSchemaRef(modelCtor, options),
    });
  }

  export function array<T extends Entity>(
    statusCode: number,
    description: string,
    modelCtor: Function & {prototype: T},
    options?: JsonSchemaOptions<T>,
  ) {
    return response(statusCode, description, {
      schema: {
        type: 'array',
        items: getModelSchemaRef(modelCtor, options),
      },
    });
  }
}
