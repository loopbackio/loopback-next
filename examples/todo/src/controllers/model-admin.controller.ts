// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {CoreBindings, inject} from '@loopback/core';
import {
  AnyObject,
  Entity,
  juggler,
  model,
  Model,
  ModelDefinition,
  property,
} from '@loopback/repository';
import {getModelSchemaRef, post, requestBody} from '@loopback/rest';
import {
  CrudRestControllerOptions,
  defineCrudRepositoryClass,
  defineCrudRestController,
} from '@loopback/rest-crud';
import * as assert from 'assert';
import {TodoListApplication} from '..';

@model()
class DiscoverRequest extends Model {
  @property({
    required: true,
    description: 'Database connection string (url), only MySQL is supported.',
  })
  connectionString: string;

  @property({
    type: 'array',
    itemType: 'string',
    description: 'List of table models to discover & load',
  })
  tableNames: string[];

  constructor(data?: Partial<DiscoverRequest>) {
    super(data);
  }
}

@model({settings: {strict: false}})
class DiscoverResponse extends Model {
  @property({
    type: 'object',
    required: true,
    description:
      'A map from table names to endpoint paths, e.g. PRODUCT -> /products',
  })
  endpoints: {
    [tableName: string]: string;
  };

  constructor(data?: Partial<DiscoverResponse>) {
    super(data);
    if (!this.endpoints) this.endpoints = {};
  }
}

export class ModelAdminController {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private app: TodoListApplication,
  ) {}

  @post('/discover', {
    responses: {
      200: {
        description: 'Information about discovered models',
        content: {
          'application/json': {schema: getModelSchemaRef(DiscoverResponse)},
        },
      },
    },
  })
  async discoverAndPublishModels(
    @requestBody() {connectionString, tableNames}: DiscoverRequest,
  ): Promise<DiscoverResponse> {
    const result = new DiscoverResponse();

    const ds = await getDataSourceForConnectionString(
      this.app,
      connectionString,
    );

    for (const table of tableNames) {
      console.log('Discovering table %j', table);

      const modelDef = await discoverModelDefinition(ds, table);

      const modelClass = defineModelClass(Entity, modelDef);
      const basePath = '/' + modelDef.name;
      bootModelApi(this.app, ds.name, modelClass, {basePath});

      result.endpoints[table] = basePath;
    }

    return result;
  }
}

let dbCounter = 0;

async function getDataSourceForConnectionString(
  app: TodoListApplication,
  connectionString: string,
) {
  // To keep our proof-of-concept simple, we create a new datasource instance
  // for each new discovery request.
  // In a real application, we should probably re-use datasource instances
  // sharing the same connection string.
  const dsName = `db-${++dbCounter}`;
  console.log('Connecting to %j - datasource %j', connectionString, dsName);
  const ds = new juggler.DataSource({
    name: dsName,
    connector: require('loopback-connector-mysql'),
    url: connectionString,
  });
  await ds.connect();
  app.dataSource(ds, dsName);
  assert.equal(ds.name, dsName);
  return ds;
}

// Ideally, `@loopback/repository` should provide a function to discover
// model definition in LB4 format. For example, it could be responsibility
// of a DataSource, in which case we need to implement custom DataSource
// class backed by juggler DataSource but performing any necessary conversions.

async function discoverModelDefinition(
  ds: juggler.DataSource,
  table: string,
): Promise<ModelDefinition> {
  // FIXME(bajtos) fix discoverSchemas, it does not return PromiseOrVoid
  const discoveredModels = (await ds.discoverSchemas(table)) as AnyObject;
  /* Example output from MySQL:
     {
       'test.CoffeeShop': {
         name: 'Coffeeshop',
         options: {
           idInjection: false,
           mysql: {schema: 'test', table: 'CoffeeShop'},
         },
         properties: {
           id: {
             type: 'Number',
             required: true,
             length: null,
             precision: 10,
             scale: 0,
             id: 1,
             mysql: {
               columnName: 'id',
               dataType: 'int',
               dataLength: null,
               dataPrecision: 10,
               dataScale: 0,
               nullable: 'N',
             },
           },
           name: {
             type: 'String',
             required: false,
             length: 512,
             precision: null,
             scale: null,
             mysql: {
               columnName: 'name',
               dataType: 'varchar',
               dataLength: 512,
               dataPrecision: null,
               dataScale: null,
               nullable: 'Y',
             },
           },
           city: {
             type: 'String',
             required: false,
             length: 512,
             precision: null,
             scale: null,
             mysql: {
               columnName: 'city',
               dataType: 'varchar',
               dataLength: 512,
               dataPrecision: null,
               dataScale: null,
               nullable: 'Y',
             },
           },
       }}}
     */
  const jugglerDef = discoveredModels[Object.keys(discoveredModels)[0]];

  return new ModelDefinition({
    name: jugglerDef.name,
    // TODO: convert from juggler/LB3 style to LB4
    // For example, we need to transform array-type definitions.
    properties: jugglerDef.properties,
    settings: jugglerDef.options,
  });
}

// TODO: move this function to '@loopback/repository'
function defineModelClass<T extends typeof Model>(
  base: T /* Model or Entity */,
  definition: ModelDefinition,
): T {
  const modelName = definition.name;
  const defineNamedModelClass = new Function(
    'BaseClass',
    `return class ${modelName} extends BaseClass {}`,
  );
  const modelClass = defineNamedModelClass(base) as T;
  assert.equal(modelClass.name, modelName);
  modelClass.definition = definition;
  console.log('Defined model class %s', definition.name);
  return modelClass;
}

// This will be implemented by
// https://github.com/strongloop/loopback-next/issues/2036
// In particular https://github.com/strongloop/loopback-next/issues/3737
function bootModelApi(
  app: TodoListApplication,
  dsName: string,
  modelClass: typeof Entity,
  options: CrudRestControllerOptions,
) {
  const RepositoryClass = defineCrudRepositoryClass(modelClass);
  inject(`datasources.${dsName}`)(RepositoryClass, undefined, 0);
  const repoBinding = app.repository(RepositoryClass);
  console.log('Defined repository %s', RepositoryClass.name);

  const ControllerClass = defineCrudRestController(modelClass, options);
  inject(repoBinding.key)(ControllerClass, undefined, 0);
  app.controller(ControllerClass);
  console.log('Defined controller %s', ControllerClass.name);
}
